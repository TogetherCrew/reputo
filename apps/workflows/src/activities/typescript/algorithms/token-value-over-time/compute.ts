import type { ChainPositionCursor } from '@reputo/onchain-data';
import { generateKey, type Storage } from '@reputo/storage';
import { Context } from '@temporalio/activity';

import config from '../../../../config/index.js';
import { HEARTBEAT_INTERVAL } from '../../../../shared/constants/index.js';
import type { AlgorithmResult, Snapshot } from '../../../../shared/types/index.js';
import { stringifyCsvAsync } from '../../../../shared/utils/index.js';
import { formatBenchmarkOutput } from './benchmark/index.js';
import { replayTransfers, scoreWalletLots } from './pipeline/index.js';
import {
  createOnchainTransferRepo,
  extractInputs,
  initializeWalletLots,
  loadTargetWallets,
  loadTransferPageForWallets,
  resolveSelectedAssetKeys,
} from './utils/index.js';

const TRANSFERS_PAGE_LIMIT = 1000;

export async function computeTokenValueOverTime(snapshot: Snapshot, storage: Storage): Promise<AlgorithmResult> {
  const ctx = Context.current();
  const logger = ctx.log;
  const snapshotId = snapshot._id;

  const params = extractInputs(snapshot.algorithmPresetFrozen.inputs);
  const selectedAssetKeys = resolveSelectedAssetKeys(params.selectedAssets);
  const targetWallets = loadTargetWallets();

  logger.info('Starting token_value_over_time algorithm', { snapshotId });
  logger.info('Algorithm parameters', params);
  logger.info('Target wallets loaded', {
    walletCount: targetWallets.length,
    assetKeyCount: selectedAssetKeys.length,
  });

  const repo = await createOnchainTransferRepo();
  logger.info('Transfer repository ready');

  try {
    const createdAt = snapshot.createdAt;
    const snapshotCreatedAt =
      createdAt instanceof Date ? createdAt : createdAt != null ? new Date(createdAt) : new Date();
    const targetWalletSet = new Set(targetWallets);
    const walletLots = initializeWalletLots(targetWallets);
    const replayStats = {
      processed: 0,
      skippedZeroAmount: 0,
      skippedSelfTransfers: 0,
    };
    let transferCount = 0;

    for (let i = 0; i < selectedAssetKeys.length; i++) {
      const assetKey = selectedAssetKeys[i];
      let pageCursor: ChainPositionCursor | undefined;
      let pageNumber = 0;
      let chainTransferCount = 0;
      logger.info('Processing asset', {
        assetKey,
        assetIndex: i + 1,
        totalAssets: selectedAssetKeys.length,
      });

      while (true) {
        const nextPage = pageNumber + 1;
        ctx.heartbeat({
          phase: 'load-transfers',
          assetKey,
          processedAssets: i + 1,
          totalAssets: selectedAssetKeys.length,
          pageNumber: nextPage,
          transferCount,
        });
        logger.info('Fetching transfer page', {
          assetKey,
          pageNumber: nextPage,
        });

        const transferPage = await loadTransferPageForWallets({
          repo,
          assetKey,
          walletAddresses: targetWallets,
          limit: TRANSFERS_PAGE_LIMIT,
          cursor: pageCursor,
        });

        pageNumber = nextPage;
        logger.info('Transfer page received', {
          assetKey,
          pageNumber,
          itemCount: transferPage.items.length,
          hasMore: transferPage.nextCursor != null,
        });
        chainTransferCount += transferPage.items.length;
        transferCount += transferPage.items.length;

        const pageReplayStats = replayTransfers(walletLots, transferPage.items, targetWalletSet);
        replayStats.processed += pageReplayStats.processed;
        replayStats.skippedZeroAmount += pageReplayStats.skippedZeroAmount;
        replayStats.skippedSelfTransfers += pageReplayStats.skippedSelfTransfers;

        if (pageNumber % HEARTBEAT_INTERVAL === 0 || transferPage.nextCursor === null) {
          ctx.heartbeat({
            phase: 'load-transfers',
            assetKey,
            processedAssets: i + 1,
            totalAssets: selectedAssetKeys.length,
            pageNumber,
            transferCount,
          });
        }

        if (transferPage.items.length === 0 && transferPage.nextCursor) {
          logger.warn('Stopping pagination due to empty transfer page with a non-null cursor', {
            assetKey,
            pageCursor: transferPage.nextCursor,
          });
          break;
        }
        if (transferPage.nextCursor === null) {
          break;
        }

        pageCursor = transferPage.nextCursor;
      }

      logger.info('Asset completed', {
        assetKey,
        pagesProcessed: pageNumber,
        transfersInAsset: chainTransferCount,
      });
    }

    logger.info('Computing wallet scores');
    const walletScores = scoreWalletLots({
      lotsState: walletLots,
      selectedAssetKeys,
      snapshotCreatedAt,
      maturationThresholdDays: params.maturationThresholdDays,
    });

    logger.info('Computed token value over time scores', {
      walletCount: walletScores.length,
      transferCount,
      replayStats,
    });

    ctx.heartbeat({ phase: 'upload' });
    logger.info('Uploading outputs');

    const csvRows = walletScores.map((wallet) => ({
      wallet_address: wallet.wallet_address,
      token_value: wallet.token_value,
    }));
    const csv = await stringifyCsvAsync(csvRows, {
      header: true,
      columns: ['wallet_address', 'token_value'],
    });

    const outputKey = generateKey('snapshot', snapshotId, `${snapshot.algorithmPresetFrozen.key}.csv`);
    await storage.putObject({
      bucket: config.storage.bucket,
      key: outputKey,
      body: csv,
      contentType: 'text/csv',
    });
    logger.info('CSV uploaded', { key: outputKey });

    const benchmark = formatBenchmarkOutput({
      snapshotId,
      maturationThresholdDays: params.maturationThresholdDays,
      selectedAssets: params.selectedAssets,
      selectedAssetKeys,
      targetWalletCount: targetWallets.length,
      transferCount,
      replay: replayStats,
      wallets: walletScores,
    });

    const detailsKey = generateKey('snapshot', snapshotId, 'token_value_over_time_details.json');
    await storage.putObject({
      bucket: config.storage.bucket,
      key: detailsKey,
      body: JSON.stringify(benchmark, null, 2),
      contentType: 'application/json',
    });
    logger.info('Details uploaded', { key: detailsKey });

    logger.info('Token value over time completed', {
      snapshotId,
      outputKey,
      detailsKey,
      transferCount,
      walletCount: walletScores.length,
    });
    return {
      outputs: {
        token_value_over_time: outputKey,
        token_value_over_time_details: detailsKey,
      },
    };
  } finally {
    await repo.close();
  }
}
