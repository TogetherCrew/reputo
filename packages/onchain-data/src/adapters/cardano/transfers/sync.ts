import type { DataSource } from 'typeorm';

import { insertCardanoAssetTransactions } from '../asset-transactions/repository.js';
import { toCardanoAssetTransactionRow } from '../asset-transactions/schema.js';
import { createBlockfrostCardanoAssetTransferProvider } from '../provider/provider.js';
import {
  findCardanoAssetTransactionSyncState,
  upsertCardanoAssetTransactionSyncState,
} from '../sync-state/repository.js';
import { insertCardanoTransactionUtxos } from '../transaction-utxos/repository.js';
import { toCardanoTransactionUtxoWriteSet } from '../transaction-utxos/schema.js';
import {
  CARDANO_CHAIN,
  type CardanoAssetTransferAdapter,
  type CardanoTransferTarget,
  type SyncCardanoAssetTransferResult,
} from './types.js';

const CARDANO_UTXO_FETCH_CONCURRENCY = 5;

export async function syncCardanoAssetTransfer(input: {
  db: DataSource;
  assetIdentifier: string;
  blockfrostProjectId: string;
}): Promise<SyncCardanoAssetTransferResult> {
  const adapter = createBlockfrostCardanoAssetTransferProvider({
    projectId: input.blockfrostProjectId,
  });

  return syncCardanoAssetTransferWithAdapter({
    db: input.db,
    assetIdentifier: input.assetIdentifier,
    adapter,
  });
}

export async function syncCardanoAssetTransferWithAdapter(input: {
  db: DataSource;
  assetIdentifier: string;
  adapter: CardanoAssetTransferAdapter;
  clock?: () => Date;
}): Promise<SyncCardanoAssetTransferResult> {
  const target: CardanoTransferTarget = {
    chain: CARDANO_CHAIN,
    assetIdentifier: input.assetIdentifier,
  };
  const syncState = await findCardanoAssetTransactionSyncState(input.db.manager, target);
  const order = syncState ? 'desc' : 'asc';
  const fromTxHash = syncState?.last_tx_hash ?? null;

  let pageCount = 0;
  let attemptedAssetTransactionCount = 0;
  let insertedAssetTransactionCount = 0;
  let ignoredAssetTransactionCount = 0;
  let attemptedUtxoCount = 0;
  let insertedUtxoCount = 0;
  let ignoredUtxoCount = 0;

  let nextSyncTransaction = null;
  let lastInitialTransaction = null;
  let hasNewTransactions = false;

  for await (const page of input.adapter.fetchAssetTransactions({
    assetIdentifier: target.assetIdentifier,
    order,
  })) {
    pageCount += 1;

    if (syncState && !nextSyncTransaction && page.items.length > 0) {
      nextSyncTransaction = page.items[0];
    }

    let pageItems = page.items;
    let shouldStop = false;

    if (syncState) {
      const syncBoundaryIndex = page.items.findIndex((item) => item.tx_hash === syncState.last_tx_hash);

      if (syncBoundaryIndex >= 0) {
        pageItems = page.items.slice(0, syncBoundaryIndex);
        shouldStop = true;
      }
    }

    if (pageItems.length === 0) {
      if (shouldStop) {
        break;
      }

      continue;
    }

    hasNewTransactions = true;

    const transactionUtxos = await mapWithConcurrency(
      pageItems,
      CARDANO_UTXO_FETCH_CONCURRENCY,
      async (assetTransaction) => ({
        txHash: assetTransaction.tx_hash,
        transactionUtxo: await input.adapter.fetchTransactionUtxo(assetTransaction.tx_hash),
      }),
    );

    const assetTransactionRows = pageItems.map((item) => toCardanoAssetTransactionRow(target, item));
    const transactionUtxoWriteSets = transactionUtxos.map((item) =>
      toCardanoTransactionUtxoWriteSet({
        chain: target.chain,
        txHash: item.txHash,
        transactionUtxo: item.transactionUtxo,
      }),
    );

    const batchResult = await input.db.transaction(async (transactionalEntityManager) => {
      const assetTransactionResult = await insertCardanoAssetTransactions(
        transactionalEntityManager,
        assetTransactionRows,
      );
      const transactionUtxoResult = await insertCardanoTransactionUtxos(
        transactionalEntityManager,
        transactionUtxoWriteSets,
      );

      if (!syncState) {
        const lastPageTransaction = pageItems[pageItems.length - 1];

        await upsertCardanoAssetTransactionSyncState(transactionalEntityManager, {
          chain: target.chain,
          assetIdentifier: target.assetIdentifier,
          lastAssetTransaction: lastPageTransaction,
          updatedAt: input.clock?.() ?? new Date(),
        });
      }

      return {
        assetTransactionResult,
        transactionUtxoResult,
      };
    });

    attemptedAssetTransactionCount += batchResult.assetTransactionResult.attemptedCount;
    insertedAssetTransactionCount += batchResult.assetTransactionResult.insertedCount;
    ignoredAssetTransactionCount += batchResult.assetTransactionResult.ignoredCount;
    attemptedUtxoCount += batchResult.transactionUtxoResult.attemptedCount;
    insertedUtxoCount += batchResult.transactionUtxoResult.insertedCount;
    ignoredUtxoCount += batchResult.transactionUtxoResult.ignoredCount;

    if (!syncState) {
      lastInitialTransaction = pageItems[pageItems.length - 1];
    }

    if (shouldStop) {
      break;
    }
  }

  if (syncState && hasNewTransactions && nextSyncTransaction) {
    await input.db.transaction(async (transactionalEntityManager) => {
      await upsertCardanoAssetTransactionSyncState(transactionalEntityManager, {
        chain: target.chain,
        assetIdentifier: target.assetIdentifier,
        lastAssetTransaction: nextSyncTransaction,
        updatedAt: input.clock?.() ?? new Date(),
      });
    });
  }

  return {
    chain: target.chain,
    assetIdentifier: target.assetIdentifier,
    order,
    fromTxHash,
    toTxHash: syncState
      ? hasNewTransactions
        ? (nextSyncTransaction?.tx_hash ?? fromTxHash)
        : fromTxHash
      : (lastInitialTransaction?.tx_hash ?? null),
    pageCount,
    attemptedAssetTransactionCount,
    insertedAssetTransactionCount,
    ignoredAssetTransactionCount,
    attemptedUtxoCount,
    insertedUtxoCount,
    ignoredUtxoCount,
  };
}

async function mapWithConcurrency<TInput, TOutput>(
  items: TInput[],
  concurrency: number,
  mapItem: (item: TInput, index: number) => Promise<TOutput>,
): Promise<TOutput[]> {
  if (items.length === 0) {
    return [];
  }

  const results = new Array<TOutput>(items.length);
  let nextIndex = 0;

  async function runWorker(): Promise<void> {
    for (;;) {
      const currentIndex = nextIndex;

      if (currentIndex >= items.length) {
        return;
      }

      nextIndex += 1;
      results[currentIndex] = await mapItem(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));

  return results;
}
