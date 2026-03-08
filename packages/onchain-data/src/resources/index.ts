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
import { createTransfersRepo } from './transfers/repository.js';

/**
 * Create all repositories bound to a specific database instance.
 *
 * Use this together with {@link import('../db/client.js').createDb} to get a
 * fully isolated set of repos that is safe for concurrent use.
 */
export function createRepos(db: OnchainDataDb) {
  return {
    transfers: createTransfersRepo(db),
    syncCursors: createSyncCursorsRepo(db),
  };
}

export type Repos = ReturnType<typeof createRepos>;

export { createSyncCursorsRepo, type SyncCursorsRepo } from './syncCursors/repository.js';
export * from './syncCursors/schema.js';
export type * from './syncCursors/types.js';
export * from './transfers/normalize.js';
export { createTransfersRepo, type TransfersRepo } from './transfers/repository.js';
export * from './transfers/schema.js';
export type * from './transfers/types.js';
