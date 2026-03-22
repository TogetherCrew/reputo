import type { DataSource } from 'typeorm';
import { createDataSource } from '../db/postgres.js';
import {
  type AssetTransferSyncStore,
  createPostgresAssetTransferSyncStore,
  type InsertTransferBatchResult,
} from '../db/postgres-asset-transfer-sync-store.js';
import type { AssetTransferEntity } from '../db/schema.js';
import type { AlchemyEthereumAssetTransferProvider } from '../providers/ethereum/alchemy-ethereum-asset-transfer-provider.js';
import { createAlchemyEthereumAssetTransferProvider } from '../providers/ethereum/alchemy-ethereum-asset-transfer-provider.js';
import { type AssetKey, compareHexBlocks, normalizeHexBlock, OnchainAssets } from '../shared/index.js';

const BUFFER_ITEM_COUNT = 10_000;

type BufferedTransferBatch = {
  items: AssetTransferEntity[];
  lastBlock: string | null;
  pageCount: number;
  fetchDurationMs: number;
  normalizeDurationMs: number;
};

type FlushMetrics = InsertTransferBatchResult & {
  bufferedCount: number;
  pageCount: number;
  fetchDurationMs: number;
  normalizeDurationMs: number;
  durationMs: number;
  lastBlock: string;
};

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
    const syncStore = await createPostgresAssetTransferSyncStore({
      databaseUrl: input.databaseUrl,
    });
    const provider = createAlchemyEthereumAssetTransferProvider(input.alchemyApiKey);

    return new DefaultSyncAssetTransfersService(input.assetKey, dataSource, syncStore, provider);
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

    if (compareHexBlocks(fromBlock, toBlock) > 0) {
      return {
        assetKey: this.assetKey,
        fromBlock,
        toBlock,
        insertedCount: 0,
      };
    }

    let seenTransferCount = 0;
    let nextBuffer = createEmptyBufferedBatch();

    for await (const page of this.provider.fetchAssetTransfers({
      assetKey: this.assetKey,
      assetIdentifier: asset.assetIdentifier,
      fromBlock,
      toBlock,
    })) {
      seenTransferCount += page.items.length;
      nextBuffer.items.push(...page.items);
      nextBuffer.lastBlock = page.lastBlock;
      nextBuffer.pageCount += 1;
      nextBuffer.fetchDurationMs += page.fetchDurationMs ?? 0;
      nextBuffer.normalizeDurationMs += page.normalizeDurationMs ?? 0;

      if (nextBuffer.items.length >= BUFFER_ITEM_COUNT) {
        await this.persistBufferedItems(nextBuffer);
        nextBuffer = createEmptyBufferedBatch();
      }
    }

    if (nextBuffer.lastBlock != null) {
      await this.persistBufferedItems(nextBuffer);
    }

    return { assetKey: this.assetKey, fromBlock, toBlock, insertedCount: seenTransferCount };
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
        pageCount: 0,
        fetchDurationMs: 0,
        normalizeDurationMs: 0,
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
      pageCount: batch.pageCount,
      fetchDurationMs: batch.fetchDurationMs,
      normalizeDurationMs: batch.normalizeDurationMs,
      durationMs: Date.now() - flushStartedAtMs,
      lastBlock: normalizeHexBlock(lastBlock),
    };

    console.info('[onchain-data] onchain_data_batch_flush', {
      assetKey: this.assetKey,
      pageCount: flushMetrics.pageCount,
      bufferedCount: flushMetrics.bufferedCount,
      fetchDurationMs: flushMetrics.fetchDurationMs,
      normalizeDurationMs: flushMetrics.normalizeDurationMs,
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
    pageCount: 0,
    fetchDurationMs: 0,
    normalizeDurationMs: 0,
  };
}
