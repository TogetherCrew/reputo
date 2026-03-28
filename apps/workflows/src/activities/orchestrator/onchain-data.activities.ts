import { createDb, syncCardanoAssetTransfer, syncEvmAssetTransfer } from '@reputo/onchain-data';
import { Context } from '@temporalio/activity';

import type { OnchainDataSyncContext, SyncTarget } from '../../shared/types/index.js';

export function createOnchainDataSyncActivity(ctx: OnchainDataSyncContext) {
  const { databaseUrl, alchemyApiKey, blockfrostProjectId } = ctx;

  return async function onchainDataSync(syncTargets: SyncTarget[]): Promise<void> {
    const logger = Context.current().log;

    if (syncTargets.length === 0) {
      logger.info('No sync targets provided, skipping on-chain data sync');
      return;
    }

    logger.info('Starting on-chain data sync', {
      targetCount: syncTargets.length,
      targets: syncTargets,
    });

    const db = await createDb({ databaseUrl });

    try {
      for (const target of syncTargets) {
        logger.info('Syncing asset', {
          chain: target.chain,
          identifier: target.identifier,
        });

        if (target.chain === 'cardano') {
          const result = await syncCardanoAssetTransfer({
            db,
            assetIdentifier: target.identifier,
            blockfrostProjectId,
          });
          logger.info('Cardano asset sync completed', {
            chain: target.chain,
            assetIdentifier: result.assetIdentifier,
            pageCount: result.pageCount,
            insertedAssetTransactionCount: result.insertedAssetTransactionCount,
          });
        } else if (target.chain === 'ethereum') {
          const result = await syncEvmAssetTransfer({
            db,
            chain: target.chain,
            assetIdentifier: target.identifier,
            alchemyApiKey,
          });
          logger.info('EVM asset sync completed', {
            chain: target.chain,
            assetIdentifier: result.assetIdentifier,
            fromBlock: result.fromBlock,
            toBlock: result.toBlock,
            insertedCount: result.insertedCount,
          });
        }

        Context.current().heartbeat({
          chain: target.chain,
          identifier: target.identifier,
        });
      }

      logger.info('On-chain data sync completed for all targets');
    } finally {
      await db.destroy();
    }
  };
}
