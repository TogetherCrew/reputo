import type { DataSource } from 'typeorm';

import { compareHexBlocks } from '../provider/blocks.js';
import { createAlchemyEvmAssetTransferProvider } from '../provider/provider.js';
import { findEvmAssetTransferSyncState, upsertEvmAssetTransferSyncState } from '../sync-state/repository.js';
import { insertEvmAssetTransfers } from './repository.js';
import { toEvmAssetTransferRow } from './schema.js';
import type { EvmAssetTransferAdapter, EvmTransferTarget, SyncEvmAssetTransferResult } from './types.js';

const EVM_PROVIDER_PAGE_SIZE = 1000;
const EVM_SYNC_PAGES_PER_BATCH = 5;
const EVM_SYNC_BATCH_SIZE = EVM_PROVIDER_PAGE_SIZE * EVM_SYNC_PAGES_PER_BATCH;

export async function syncEvmAssetTransfer(input: {
  db: DataSource;
  chain: string;
  assetIdentifier: string;
  alchemyApiKey: string;
}): Promise<SyncEvmAssetTransferResult> {
  const adapter = createAlchemyEvmAssetTransferProvider({
    apiKey: input.alchemyApiKey,
  });

  return syncEvmAssetTransferWithAdapter({
    db: input.db,
    chain: input.chain,
    assetIdentifier: input.assetIdentifier,
    adapter,
  });
}

export async function syncEvmAssetTransferWithAdapter(input: {
  db: DataSource;
  chain: string;
  assetIdentifier: string;
  adapter: EvmAssetTransferAdapter;
  clock?: () => Date;
}): Promise<SyncEvmAssetTransferResult> {
  const target: EvmTransferTarget = {
    chain: input.chain,
    assetIdentifier: input.assetIdentifier,
  };
  const syncState = await findEvmAssetTransferSyncState(input.db.manager, target);
  const fromBlock = syncState?.last_synced_block ?? '0x0';
  const toBlock = await input.adapter.getFinalizedBlock(target.chain);

  if (compareHexBlocks(fromBlock, toBlock) > 0) {
    return {
      chain: target.chain,
      assetIdentifier: target.assetIdentifier,
      fromBlock,
      toBlock,
      pageCount: 0,
      attemptedCount: 0,
      insertedCount: 0,
      ignoredCount: 0,
    };
  }

  let pageCount = 0;
  let attemptedCount = 0;
  let insertedCount = 0;
  let ignoredCount = 0;
  let pendingPages: {
    items: Parameters<typeof toEvmAssetTransferRow>[1][];
    lastBlock: string;
  }[] = [];

  async function flushPendingPages(): Promise<void> {
    if (pendingPages.length === 0) {
      return;
    }

    const lastPendingPage = pendingPages[pendingPages.length - 1];
    const rows = pendingPages.flatMap((page) => page.items.map((item) => toEvmAssetTransferRow(target, item)));
    const batchResult = await input.db.transaction(async (transactionalEntityManager) => {
      const persistResult = await insertEvmAssetTransfers(transactionalEntityManager, rows);

      await upsertEvmAssetTransferSyncState(transactionalEntityManager, {
        chain: target.chain,
        assetIdentifier: target.assetIdentifier,
        lastSyncedBlock: lastPendingPage.lastBlock,
        updatedAt: input.clock?.() ?? new Date(),
      });

      return persistResult;
    });

    attemptedCount += batchResult.attemptedCount;
    insertedCount += batchResult.insertedCount;
    ignoredCount += batchResult.ignoredCount;
    pendingPages = [];
  }

  for await (const page of input.adapter.fetchAssetTransfers({
    chain: target.chain,
    assetIdentifier: target.assetIdentifier,
    fromBlock,
    toBlock,
  })) {
    pageCount += 1;
    pendingPages.push(page);

    if (pendingPages.length * EVM_PROVIDER_PAGE_SIZE >= EVM_SYNC_BATCH_SIZE) {
      await flushPendingPages();
    }
  }

  if (pendingPages.length > 0) {
    await flushPendingPages();
  }

  return {
    chain: target.chain,
    assetIdentifier: target.assetIdentifier,
    fromBlock,
    toBlock,
    pageCount,
    attemptedCount,
    insertedCount,
    ignoredCount,
  };
}
