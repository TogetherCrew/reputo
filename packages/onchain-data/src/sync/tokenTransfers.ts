import { eq } from 'drizzle-orm';
import { CHAIN_IDS } from '../providers/evm/alchemy/config.js';
import { createSyncCursorsRepo } from '../resources/syncCursors/repository.js';
import { syncCursors } from '../resources/syncCursors/schema.js';
import { createSyncRunsRepo } from '../resources/syncRuns/repository.js';
import { syncRuns } from '../resources/syncRuns/schema.js';
import { normalizeTransferToRecord } from '../resources/transfers/normalize.js';
import { transfers } from '../resources/transfers/schema.js';
import { canonicalizeEvmAddress } from '../shared/utils/evm.js';
import { chunkArray, DEFAULT_CHUNK_SIZE } from '../shared/utils/index.js';
import type { SyncServiceDeps, SyncTokenTransfersInput, SyncTokenTransfersResult } from './types.js';

/**
 * Upper bound sent to the provider when the orchestration wants
 * "everything up to the latest finalized block".
 * The provider is responsible for capping this to the actual finalized block.
 */
const REQUESTED_TO_BLOCK_MAX = Number.MAX_SAFE_INTEGER;

/**
 * Create a sync service that orchestrates incremental token-transfer ingestion.
 *
 * The service owns target identity, range calculation, sync-run lifecycle,
 * and transactional persistence. Finalized-block resolution and transfer
 * normalization remain in the provider boundary.
 */
export function createSyncService(deps: SyncServiceDeps) {
  const { provider, db } = deps;
  const syncCursorsRepo = createSyncCursorsRepo(db);
  const syncRunsRepo = createSyncRunsRepo(db);

  return {
    async syncTokenTransfers(input: SyncTokenTransfersInput): Promise<SyncTokenTransfersResult> {
      const { chain, tokenContractAddress, initialStartBlock } = input;

      const chainId = CHAIN_IDS[chain];
      if (!chainId) {
        throw new Error(`Unknown chain: "${chain}". No chain ID mapping found.`);
      }

      const normalizedTokenAddress = canonicalizeEvmAddress(tokenContractAddress);

      const existingCursor = syncCursorsRepo.findByChainAndToken(chainId, normalizedTokenAddress);

      const requestedFromBlock = existingCursor ? existingCursor.cursorBlock + 1 : initialStartBlock;
      const requestedToBlock = REQUESTED_TO_BLOCK_MAX;

      const syncRunId = syncRunsRepo.create({
        chainId,
        tokenAddress: normalizedTokenAddress,
        requestedFromBlock,
        requestedToBlock,
        effectiveToBlock: null,
        status: 'started',
        errorSummary: null,
        startedAt: new Date().toISOString(),
        completedAt: null,
      });

      try {
        const { transfers: transferEvents, effectiveToBlock } = await provider.fetchErc20Transfers({
          chain,
          tokenContractAddress: normalizedTokenAddress,
          fromBlock: requestedFromBlock,
          requestedToBlock,
        });

        if (requestedFromBlock > effectiveToBlock) {
          syncRunsRepo.updateStatus(syncRunId, {
            status: 'noop',
            effectiveToBlock,
            completedAt: new Date().toISOString(),
          });

          return {
            status: 'noop',
            syncRunId,
            requestedFromBlock,
            requestedToBlock,
            effectiveToBlock,
            transferCount: 0,
          };
        }

        const completedAt = new Date().toISOString();

        db.sqlite.transaction(() => {
          if (transferEvents.length > 0) {
            const records = transferEvents.map(normalizeTransferToRecord);
            for (const chunk of chunkArray(records, DEFAULT_CHUNK_SIZE)) {
              db.drizzle.insert(transfers).values(chunk).onConflictDoNothing().run();
            }
          }

          db.drizzle
            .insert(syncCursors)
            .values({
              chainId,
              tokenAddress: normalizedTokenAddress,
              cursorBlock: effectiveToBlock,
              updatedAt: completedAt,
            })
            .onConflictDoUpdate({
              target: [syncCursors.chainId, syncCursors.tokenAddress],
              set: { cursorBlock: effectiveToBlock, updatedAt: completedAt },
            })
            .run();

          db.drizzle
            .update(syncRuns)
            .set({ status: 'succeeded', effectiveToBlock, completedAt })
            .where(eq(syncRuns.id, syncRunId))
            .run();
        })();

        return {
          status: 'succeeded',
          syncRunId,
          requestedFromBlock,
          requestedToBlock,
          effectiveToBlock,
          transferCount: transferEvents.length,
        };
      } catch (error) {
        const errorSummary = error instanceof Error ? error.message : String(error);
        syncRunsRepo.updateStatus(syncRunId, {
          status: 'failed',
          errorSummary,
          completedAt: new Date().toISOString(),
        });

        return {
          status: 'failed',
          syncRunId,
          requestedFromBlock,
          requestedToBlock,
          effectiveToBlock: null,
          transferCount: 0,
          error: errorSummary,
        };
      }
    },
  };
}

export type SyncService = ReturnType<typeof createSyncService>;
