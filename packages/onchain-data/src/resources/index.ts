/**
 * Resources module for onchain data
 *
 * Each resource contains:
 * - types: Entity-specific type definitions
 * - normalize: Normalization functions to transform API responses to DB records
 * - repository: Database create and read functions
 * - schema: Drizzle schema definitions
 */

import type { OnchainDataDb } from '../shared/types/db.js';
import { createSyncCursorsRepo } from './syncCursors/repository.js';
import { createSyncRunsRepo } from './syncRuns/repository.js';
import { createDeterministicTransferQueries } from './transfers/queries.js';
import { createTransfersRepo } from './transfers/repository.js';

/**
 * Create all repositories and query helpers bound to a specific database instance.
 *
 * Use this together with {@link import('../db/client.js').createDb} to get a
 * fully isolated set of repos that is safe for concurrent use.
 */
export function createRepos(db: OnchainDataDb) {
  return {
    transfers: createTransfersRepo(db),
    transferQueries: createDeterministicTransferQueries(db),
    syncCursors: createSyncCursorsRepo(db),
    syncRuns: createSyncRunsRepo(db),
  };
}

export type Repos = ReturnType<typeof createRepos>;

export { createSyncCursorsRepo, type SyncCursorsRepo } from './syncCursors/repository.js';
export * from './syncCursors/schema.js';
export type * from './syncCursors/types.js';
export { createSyncRunsRepo, type SyncRunsRepo } from './syncRuns/repository.js';
export * from './syncRuns/schema.js';
export type * from './syncRuns/types.js';
export * from './transfers/normalize.js';
export { createDeterministicTransferQueries, type DeterministicTransferQueries } from './transfers/queries.js';
export { createTransfersRepo, type TransfersRepo } from './transfers/repository.js';
export * from './transfers/schema.js';
export type * from './transfers/types.js';
