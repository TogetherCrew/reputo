import type { DataSource } from 'typeorm';

import { insertCardanoAssetTransactions } from '../asset-transactions/repository.js';
import { toCardanoAssetTransactionRow } from '../asset-transactions/schema.js';
import { createBlockfrostCardanoAssetTransferProvider } from '../provider/provider.js';
import type { RawCardanoAssetTransaction } from '../provider/types.js';
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
  blockfrostAPIKey: string;
}): Promise<SyncCardanoAssetTransferResult> {
  const adapter = createBlockfrostCardanoAssetTransferProvider({
    projectId: input.blockfrostAPIKey,
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
  const fromPage = syncState?.last_synced_page ?? 1;
  const order = 'asc';
  const fromTxHash = syncState?.last_tx_hash ?? null;

  let pageCount = 0;
  let attemptedAssetTransactionCount = 0;
  let insertedAssetTransactionCount = 0;
  let ignoredAssetTransactionCount = 0;
  let attemptedUtxoCount = 0;
  let insertedUtxoCount = 0;
  let ignoredUtxoCount = 0;
  let currentPage = fromPage;
  let syncBoundaryFound = syncState == null;
  let lastSyncedTransaction: RawCardanoAssetTransaction | null = null;

  for await (const page of input.adapter.fetchAssetTransactions({
    assetIdentifier: target.assetIdentifier,
    order,
    fromPage,
  })) {
    pageCount += 1;

    let pageItems = page.items;

    if (syncState) {
      if (!syncBoundaryFound) {
        const syncBoundaryIndex = page.items.findIndex((item) => item.tx_hash === syncState.last_tx_hash);

        if (syncBoundaryIndex >= 0) {
          syncBoundaryFound = true;
          pageItems = page.items.slice(syncBoundaryIndex + 1);
        } else {
          throw new Error(
            `Cardano sync boundary transaction ${syncState.last_tx_hash} was not found on page ${currentPage} for asset ${target.assetIdentifier}`,
          );
        }
      }
    }

    if (pageItems.length === 0) {
      currentPage += 1;
      continue;
    }

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
    const lastPageTransaction = pageItems[pageItems.length - 1];
    lastSyncedTransaction = lastPageTransaction;

    const batchResult = await input.db.transaction(async (transactionalEntityManager) => {
      const assetTransactionResult = await insertCardanoAssetTransactions(
        transactionalEntityManager,
        assetTransactionRows,
      );
      const transactionUtxoResult = await insertCardanoTransactionUtxos(
        transactionalEntityManager,
        transactionUtxoWriteSets,
      );

      await upsertCardanoAssetTransactionSyncState(transactionalEntityManager, {
        chain: target.chain,
        assetIdentifier: target.assetIdentifier,
        lastAssetTransaction: lastPageTransaction,
        lastSyncedPage: currentPage,
        updatedAt: input.clock?.() ?? new Date(),
      });

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
    currentPage += 1;
  }

  if (syncState && !syncBoundaryFound) {
    throw new Error(
      `Cardano sync boundary transaction ${syncState.last_tx_hash} was not found on page ${fromPage} for asset ${target.assetIdentifier}`,
    );
  }

  return {
    chain: target.chain,
    assetIdentifier: target.assetIdentifier,
    order,
    fromTxHash,
    toTxHash: lastSyncedTransaction?.tx_hash ?? fromTxHash,
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
