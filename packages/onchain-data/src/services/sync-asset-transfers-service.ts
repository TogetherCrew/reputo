import type { DataSource } from 'typeorm';
import { createDataSource } from '../db/postgres.js';
import {
  type AssetTransferSyncStore,
  createPostgresSyncStore,
  type InsertTransferBatchResult,
} from '../db/postgres-sync-store.js';
import type { AssetTransferEntity } from '../db/schema.js';
import type { AlchemyEthereumAssetTransferProvider } from '../providers/ethereum/alchemy-ethereum-asset-transfer-provider.js';
import { createAlchemyEthereumAssetTransferProvider } from '../providers/ethereum/alchemy-ethereum-asset-transfer-provider.js';
import { type AssetKey, compareHexBlocks, normalizeHexBlock, OnchainAssets } from '../shared/index.js';

const BUFFER_ITEM_COUNT = 10_000;

type BufferedTransferBatch = {
  items: AssetTransferEntity[];
  lastBlock: string | null;
};

type FlushMetrics = InsertTransferBatchResult & {
  bufferedCount: number;
  durationMs: number;
  lastBlock: string;
};

type SyncRunMetrics = {
  rowsSeen: number;
  rowsInserted: number;
  rowsIgnored: number;
  fetchDurationMs: number;
  flushDurationMs: number;
  flushCount: number;
};

type SyncMetricLogger = (event: 'sync_flush' | 'sync_summary', payload: Record<string, unknown>) => void;

export type SyncAssetTransfersResult = {
  assetKey: AssetKey;
  fromBlock: string;
  toBlock: string;
  insertedCount: number;
};

export interface SyncAssetTransfersService {
  sync(): Promise<SyncAssetTransfersResult>;
  close(): Promise<void>;
}

export type CreateSyncAssetTransfersServiceInput = {
  assetKey: AssetKey;
  databaseUrl: string;
  alchemyApiKey: string;
};

export async function createSyncAssetTransfersService(
  input: CreateSyncAssetTransfersServiceInput,
): Promise<SyncAssetTransfersService> {
  const dataSource = await createDataSource(input.databaseUrl);

  try {
    const syncStore = await createPostgresSyncStore({
      databaseUrl: input.databaseUrl,
    });
    const provider = createAlchemyEthereumAssetTransferProvider(input.alchemyApiKey);

    return new DefaultSyncAssetTransfersService(
      input.assetKey,
      dataSource,
      syncStore,
      provider,
      undefined,
      createDefaultSyncMetricLogger(input.assetKey),
    );
  } catch (error) {
    await dataSource.destroy();
    throw error;
  }
}

export class DefaultSyncAssetTransfersService implements SyncAssetTransfersService {
  constructor(
    private readonly assetKey: AssetKey,
    private readonly dataSource: DataSource,
    private readonly syncStore: AssetTransferSyncStore,
    private readonly provider: AlchemyEthereumAssetTransferProvider,
    private readonly clock: () => string = () => new Date().toISOString(),
    private readonly logMetrics: SyncMetricLogger = () => undefined,
  ) {}

  async sync(): Promise<SyncAssetTransfersResult> {
    const asset = OnchainAssets[this.assetKey];
    if (asset.provider !== 'Alchemy') {
      return {
        assetKey: this.assetKey,
        fromBlock: asset.startblock,
        toBlock: asset.startblock,
        insertedCount: 0,
      };
    }
    const { fromBlock, toBlock } = await this.resolveSyncRange(asset.startblock);
    const startedAtMs = Date.now();
    const metrics: SyncRunMetrics = {
      rowsSeen: 0,
      rowsInserted: 0,
      rowsIgnored: 0,
      fetchDurationMs: 0,
      flushDurationMs: 0,
      flushCount: 0,
    };

    if (compareHexBlocks(fromBlock, toBlock) > 0) {
      return {
        assetKey: this.assetKey,
        fromBlock,
        toBlock,
        insertedCount: 0,
      };
    }

    let activeFlush: Promise<FlushMetrics> | null = null;
    let nextBuffer = createEmptyBufferedBatch();
    const iterator = this.provider
      .fetchAssetTransfers({
        assetKey: this.assetKey,
        assetIdentifier: asset.assetIdentifier,
        fromBlock,
        toBlock,
      })
      [Symbol.asyncIterator]();

    try {
      for (;;) {
        const fetchStartedAtMs = Date.now();
        const page = await iterator.next();
        metrics.fetchDurationMs += Date.now() - fetchStartedAtMs;

        if (page.done) {
          break;
        }

        metrics.rowsSeen += page.value.items.length;
        nextBuffer.items.push(...page.value.items);
        nextBuffer.lastBlock = page.value.lastBlock;

        if (nextBuffer.items.length >= BUFFER_ITEM_COUNT) {
          activeFlush = await maybeDrainActiveFlush(activeFlush, metrics);
          const flushBuffer = nextBuffer;
          nextBuffer = createEmptyBufferedBatch();
          activeFlush = this.persistBufferedItems(flushBuffer);
        }
      }

      activeFlush = await maybeDrainActiveFlush(activeFlush, metrics);

      if (nextBuffer.lastBlock != null) {
        recordFlushMetrics(metrics, await this.persistBufferedItems(nextBuffer));
      }

      const durationMs = Date.now() - startedAtMs;
      this.logMetrics('sync_summary', {
        assetKey: this.assetKey,
        status: 'success',
        fromBlock,
        toBlock,
        rowsSeen: metrics.rowsSeen,
        rowsInserted: metrics.rowsInserted,
        rowsIgnored: metrics.rowsIgnored,
        fetchDurationMs: metrics.fetchDurationMs,
        flushDurationMs: metrics.flushDurationMs,
        flushCount: metrics.flushCount,
        durationMs,
        rowsPerSecond: calculateRowsPerSecond(metrics.rowsSeen, durationMs),
      });

      return { assetKey: this.assetKey, fromBlock, toBlock, insertedCount: metrics.rowsSeen };
    } catch (error) {
      if (activeFlush) {
        try {
          recordFlushMetrics(metrics, await activeFlush);
        } catch {
          // Prefer surfacing the original sync failure.
        }
      }

      const durationMs = Date.now() - startedAtMs;
      this.logMetrics('sync_summary', {
        assetKey: this.assetKey,
        status: 'failed',
        fromBlock,
        toBlock,
        rowsSeen: metrics.rowsSeen,
        rowsInserted: metrics.rowsInserted,
        rowsIgnored: metrics.rowsIgnored,
        fetchDurationMs: metrics.fetchDurationMs,
        flushDurationMs: metrics.flushDurationMs,
        flushCount: metrics.flushCount,
        durationMs,
        rowsPerSecond: calculateRowsPerSecond(metrics.rowsSeen, durationMs),
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async close(): Promise<void> {
    let storeError: unknown;

    try {
      await this.syncStore.close();
    } catch (error) {
      storeError = error;
    } finally {
      await this.dataSource.destroy();
    }

    if (storeError != null) {
      throw storeError;
    }
  }

  private async resolveSyncRange(startBlock: string): Promise<{ fromBlock: string; toBlock: string }> {
    const syncState = await this.syncStore.findByAssetKey(this.assetKey);
    const fromBlock = syncState ? normalizeHexBlock(syncState.lastSyncedBlock) : normalizeHexBlock(startBlock);
    const toBlock = normalizeHexBlock(await this.provider.getToBlock());
    return { fromBlock, toBlock };
  }

  private async persistBufferedItems(batch: BufferedTransferBatch): Promise<FlushMetrics> {
    const { lastBlock } = batch;

    if (lastBlock == null) {
      return {
        attemptedCount: 0,
        insertedCount: 0,
        ignoredCount: 0,
        bufferedCount: 0,
        durationMs: 0,
        lastBlock: normalizeHexBlock(0),
      };
    }

    const flushStartedAtMs = Date.now();
    const asset = OnchainAssets[this.assetKey];
    const lastItem = batch.items.length > 0 ? batch.items[batch.items.length - 1] : null;
    const insertMetrics = await this.syncStore.withTransaction(async (tx) => {
      const metrics = await tx.insertTransferBatch(batch.items);
      await tx.upsertSyncState({
        chain: asset.chain,
        assetIdentifier: asset.assetIdentifier,
        lastSyncedBlock: normalizeHexBlock(lastBlock),
        lastTransactionHash: lastItem?.transaction_hash ?? null,
        lastLogIndex: lastItem?.log_index ?? null,
        updatedAt: this.clock(),
      });
      return metrics;
    });

    const flushMetrics: FlushMetrics = {
      ...insertMetrics,
      bufferedCount: batch.items.length,
      durationMs: Date.now() - flushStartedAtMs,
      lastBlock: normalizeHexBlock(lastBlock),
    };

    this.logMetrics('sync_flush', {
      assetKey: this.assetKey,
      bufferedCount: flushMetrics.bufferedCount,
      insertedCount: flushMetrics.insertedCount,
      ignoredCount: flushMetrics.ignoredCount,
      durationMs: flushMetrics.durationMs,
      lastBlock: flushMetrics.lastBlock,
    });

    return flushMetrics;
  }
}

function createEmptyBufferedBatch(): BufferedTransferBatch {
  return {
    items: [],
    lastBlock: null,
  };
}

async function maybeDrainActiveFlush(
  activeFlush: Promise<FlushMetrics> | null,
  metrics: SyncRunMetrics,
): Promise<null> {
  if (!activeFlush) {
    return null;
  }

  recordFlushMetrics(metrics, await activeFlush);
  return null;
}

function recordFlushMetrics(metrics: SyncRunMetrics, flushMetrics: FlushMetrics): void {
  metrics.rowsInserted += flushMetrics.insertedCount;
  metrics.rowsIgnored += flushMetrics.ignoredCount;
  metrics.flushDurationMs += flushMetrics.durationMs;
  metrics.flushCount += 1;
}

function calculateRowsPerSecond(rowsSeen: number, durationMs: number): number {
  if (rowsSeen === 0 || durationMs <= 0) {
    return 0;
  }

  return Number((rowsSeen / (durationMs / 1000)).toFixed(2));
}

function createDefaultSyncMetricLogger(assetKey: AssetKey): SyncMetricLogger {
  return (event, payload) => {
    console.info(`[onchain-data] ${event}`, {
      assetKey,
      ...payload,
    });
  };
}
