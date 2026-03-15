import { createSyncTokenTransfersService, SupportedTokenChain } from '@reputo/onchain-data';
import { Context } from '@temporalio/activity';

import type { OnchainDataSyncContext } from '../../shared/types/index.js';

export function createOnchainDataSyncActivity(ctx: OnchainDataSyncContext) {
  const { dbPath, alchemyApiKey } = ctx;

  return async function onchainDataSync(): Promise<void> {
    const logger = Context.current().log;
    const tokenChains = Object.values(SupportedTokenChain);

    logger.info('Starting on-chain data sync', {
      dbPath,
      tokenChains,
    });

    for (const tokenChain of tokenChains) {
      const service = await createSyncTokenTransfersService({
        tokenChain,
        dbPath,
        alchemyApiKey,
      });

      try {
        const result = await service.sync();

        logger.info('Token chain sync completed', {
          tokenChain: result.tokenChain,
          fromBlock: result.fromBlock,
          toBlock: result.toBlock,
          insertedCount: result.insertedCount,
        });
      } finally {
        await service.close();
      }

      Context.current().heartbeat(tokenChain);
    }

    logger.info('On-chain data sync completed for all token chains');
  };
}
