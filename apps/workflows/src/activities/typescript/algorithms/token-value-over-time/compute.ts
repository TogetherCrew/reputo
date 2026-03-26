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
  getWalletsForChain,
  getWalletsForSelectedAssets,
  initializeWalletLots,
  loadTransferPageForWallets,
  loadWalletAddressMap,
  resolveSelectedAssets,
} from './utils/index.js';

const TRANSFERS_PAGE_LIMIT = 500;
const WALLET_CHUNK_SIZE = 100;

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

export async function computeTokenValueOverTime(snapshot: Snapshot, storage: Storage): Promise<AlgorithmResult> {
  const ctx = Context.current();
  const logger = ctx.log;
  const snapshotId = snapshot._id;

  const createdAt = snapshot.createdAt;
  const snapshotCreatedAt =
    createdAt instanceof Date ? createdAt : createdAt != null ? new Date(createdAt) : new Date();

  const params = extractInputs(snapshot.algorithmPresetFrozen.inputs, snapshotCreatedAt);
  const resolvedSelectedAssets = resolveSelectedAssets(params.selectedAssets);
  const selectedAssetKeys = resolvedSelectedAssets.map((asset) => asset.assetKey);
  const walletAddressMap = await loadWalletAddressMap({
    storage,
    bucket: config.storage.bucket,
    key: params.walletsKey,
  });
  const targetWallets = getWalletsForSelectedAssets(walletAddressMap, params.selectedAssets);

  logger.info('Starting token_value_over_time algorithm', { snapshotId });
  logger.info('Algorithm parameters', {
    maturationThresholdDays: params.maturationThresholdDays,
    selectedAssets: params.selectedAssets,
    walletsKey: params.walletsKey,
    effectiveDateRange: params.effectiveDateRange,
  });
  logger.info('Target wallets loaded', {
    walletCount: targetWallets.length,
    assetKeyCount: selectedAssetKeys.length,
  });

  const repo = await createOnchainTransferRepo();

  try {
    const targetWalletSet = new Set(targetWallets);
    const walletLots = initializeWalletLots(targetWallets);
    const replayStats = {
      processed: 0,
      skippedZeroAmount: 0,
      skippedSelfTransfers: 0,
    };
    let transferCount = 0;

    for (let i = 0; i < resolvedSelectedAssets.length; i++) {
      const asset = resolvedSelectedAssets[i];
      const assetWallets = getWalletsForChain(walletAddressMap, asset.chain);
      const walletChunks = chunkArray(assetWallets, WALLET_CHUNK_SIZE);
      let pagesProcessed = 0;
      let chainTransferCount = 0;
      logger.info('Processing asset', {
        assetKey: asset.assetKey,
        chain: asset.chain,
        assetIndex: i + 1,
        totalAssets: resolvedSelectedAssets.length,
        walletCount: assetWallets.length,
        walletChunkCount: walletChunks.length,
      });

      for (let chunkIndex = 0; chunkIndex < walletChunks.length; chunkIndex++) {
        const walletChunk = walletChunks[chunkIndex];
        let pageNumber = 1;

        while (true) {
          ctx.heartbeat({
            phase: 'load-transfers',
            assetKey: asset.assetKey,
            processedAssets: i + 1,
            totalAssets: resolvedSelectedAssets.length,
            pageNumber,
            chunkIndex: chunkIndex + 1,
            totalChunks: walletChunks.length,
            transferCount,
          });
          logger.info('Fetching transfer page', {
            assetKey: asset.assetKey,
            pageNumber,
            chunkIndex: chunkIndex + 1,
            totalChunks: walletChunks.length,
          });

          const fetchStartedAt = Date.now();
          const transferPage = await loadTransferPageForWallets({
            repo,
            assetKey: asset.assetKey,
            walletAddresses: walletChunk,
            page: pageNumber,
            limit: TRANSFERS_PAGE_LIMIT,
            fromTimestampUnix: params.effectiveDateRange.fromTimestampUnix,
            toTimestampUnix: params.effectiveDateRange.toTimestampUnix,
          });
          const fetchDurationMs = Date.now() - fetchStartedAt;

          pagesProcessed += 1;
          logger.info('Transfer page received', {
            assetKey: asset.assetKey,
            pageNumber,
            chunkIndex: chunkIndex + 1,
            totalChunks: walletChunks.length,
            itemCount: transferPage.items.length,
            hasMore: transferPage.hasMore,
            fetchDurationMs,
          });
          chainTransferCount += transferPage.items.length;
          transferCount += transferPage.items.length;

          const pageReplayStats = replayTransfers(walletLots, transferPage.items, targetWalletSet);
          replayStats.processed += pageReplayStats.processed;
          replayStats.skippedZeroAmount += pageReplayStats.skippedZeroAmount;
          replayStats.skippedSelfTransfers += pageReplayStats.skippedSelfTransfers;

          if (pagesProcessed % HEARTBEAT_INTERVAL === 0 || !transferPage.hasMore) {
            ctx.heartbeat({
              phase: 'load-transfers',
              assetKey: asset.assetKey,
              processedAssets: i + 1,
              totalAssets: resolvedSelectedAssets.length,
              pageNumber,
              chunkIndex: chunkIndex + 1,
              totalChunks: walletChunks.length,
              transferCount,
            });
          }

          if (transferPage.items.length === 0 && transferPage.hasMore) {
            logger.warn('Stopping pagination due to empty transfer page with hasMore=true', {
              assetKey: asset.assetKey,
              chunkIndex: chunkIndex + 1,
              pageNumber,
            });
            break;
          }
          if (!transferPage.hasMore) {
            break;
          }

          pageNumber += 1;
        }
      }

      logger.info('Asset completed', {
        assetKey: asset.assetKey,
        pagesProcessed,
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
