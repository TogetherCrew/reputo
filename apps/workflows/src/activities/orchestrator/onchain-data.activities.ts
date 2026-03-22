import { createSyncAssetTransfersService } from '@reputo/onchain-data';
import { Context } from '@temporalio/activity';

import type { OnchainDataSyncContext } from '../../shared/types/index.js';

export function createOnchainDataSyncActivity(ctx: OnchainDataSyncContext) {
  const { databaseUrl, alchemyApiKey } = ctx;

  return async function onchainDataSync(): Promise<void> {
    const logger = Context.current().log;

    logger.info('Starting on-chain data sync', {
      databaseBackend: 'postgresql',
      assetKey: 'fet_ethereum',
    });

    logger.info('Opening PostgreSQL database for on-chain data sync');
    const service = await createSyncAssetTransfersService({
      assetKey: 'fet_ethereum',
      databaseUrl,
      alchemyApiKey,
    });
    logger.info('PostgreSQL database opened successfully, starting asset sync');

    // for (const assetKey of assetKeys) {
    //   const service = await createSyncAssetTransfersService({
    //     assetKey,
    //     databaseUrl,
    //     alchemyApiKey,
    //   });

    //   try {
    //     const result = await service.sync();

    //     logger.info('Asset sync completed', {
    //       assetKey: result.assetKey,
    //       fromBlock: result.fromBlock,
    //       toBlock: result.toBlock,
    //       insertedCount: result.insertedCount,
    //     });
    //   } finally {
    //     await service.close();
    //   }

    //   Context.current().heartbeat(assetKey);
    // }

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

    Context.current().heartbeat('fet_ethereum');

    logger.info('On-chain data sync completed for all assets');
  };
}
