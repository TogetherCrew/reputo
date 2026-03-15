import { createSyncAssetTransfersService, ONCHAIN_ASSET_KEYS } from '@reputo/onchain-data';
import { Context } from '@temporalio/activity';

import type { OnchainDataSyncContext } from '../../shared/types/index.js';

export function createOnchainDataSyncActivity(ctx: OnchainDataSyncContext) {
  const { dbPath, alchemyApiKey } = ctx;

  return async function onchainDataSync(): Promise<void> {
    const logger = Context.current().log;
    const assetKeys = ONCHAIN_ASSET_KEYS;

    logger.info('Starting on-chain data sync', {
      dbPath,
      assetKeys,
    });

    for (const assetKey of assetKeys) {
      const service = await createSyncAssetTransfersService({
        assetKey,
        dbPath,
        alchemyApiKey,
      });

      try {
        const result = await service.sync();

        logger.info('Asset sync completed', {
          assetKey: result.assetKey,
          fromBlock: result.fromBlock,
          toBlock: result.toBlock,
          insertedCount: result.insertedCount,
        });
      } finally {
        await service.close();
      }

      Context.current().heartbeat(assetKey);
    }

    logger.info('On-chain data sync completed for all assets');
  };
}
