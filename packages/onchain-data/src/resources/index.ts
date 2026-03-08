/**
 * Resources module for onchain data
 *
 * Each resource will contain:
 * - types: Entity-specific type definitions
 * - api: Fetch functions for the resource
 * - normalize: Normalization functions to transform API responses to DB records
 * - repository: Database create and read functions
 * - schema: Drizzle schema definitions
 *
 * Resources will be added in subsequent tasks.
 */

import type { OnchainDataDb } from '../shared/types/db.js';

/**
 * Create all repositories bound to a specific database instance.
 *
 * Use this together with {@link import('../db/client.js').createDb} to get a
 * fully isolated set of repos that is safe for concurrent use.
 */
export function createRepos(_db: OnchainDataDb) {
  return {};
}

export type Repos = ReturnType<typeof createRepos>;
