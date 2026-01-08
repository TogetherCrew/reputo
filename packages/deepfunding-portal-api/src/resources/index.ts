/**
 * Resources module for DeepFunding Portal API
 *
 * Each resource contains:
 * - types: Entity-specific type definitions
 * - api: Fetch functions for the resource
 * - normalize: Normalization functions to transform API responses to DB records
 * - repository: Database create and read functions
 * - schema: Drizzle schema definitions
 */

import type { DeepFundingPortalDb } from '../shared/types/db.js';
import { commentsRepo } from './comments/repository.js';
import { commentVotesRepo } from './commentVotes/repository.js';
import { milestonesRepo } from './milestones/repository.js';
import { poolsRepo } from './pools/repository.js';
import { proposalsRepo } from './proposals/repository.js';
import { reviewsRepo } from './reviews/repository.js';
// Import repositories for type definitions and attachRepos function
import { roundsRepo } from './rounds/repository.js';
import { usersRepo } from './users/repository.js';

// Re-export comments
export * from './comments/api.js';
export * from './comments/normalize.js';
export { commentsRepo } from './comments/repository.js';
export * from './comments/schema.js';
export type * from './comments/types.js';

// Re-export commentVotes
export * from './commentVotes/api.js';
export * from './commentVotes/normalize.js';
export { commentVotesRepo } from './commentVotes/repository.js';
export * from './commentVotes/schema.js';
export type * from './commentVotes/types.js';

// Re-export milestones
export * from './milestones/api.js';
export * from './milestones/normalize.js';
export { milestonesRepo } from './milestones/repository.js';
export * from './milestones/schema.js';
export type * from './milestones/types.js';

// Re-export pools
export * from './pools/api.js';
export * from './pools/normalize.js';
export { poolsRepo } from './pools/repository.js';
export * from './pools/schema.js';
export type * from './pools/types.js';

// Re-export proposals
export * from './proposals/api.js';
export * from './proposals/normalize.js';
export { proposalsRepo } from './proposals/repository.js';
export * from './proposals/schema.js';
export type * from './proposals/types.js';

// Re-export reviews
export * from './reviews/api.js';
export * from './reviews/normalize.js';
export { reviewsRepo } from './reviews/repository.js';
export * from './reviews/schema.js';
export type * from './reviews/types.js';

// Re-export rounds
export * from './rounds/api.js';
export * from './rounds/normalize.js';
export { roundsRepo } from './rounds/repository.js';
export * from './rounds/schema.js';
export type * from './rounds/types.js';

// Re-export users
export * from './users/api.js';
export * from './users/normalize.js';
export { usersRepo } from './users/repository.js';
export * from './users/schema.js';
export type * from './users/types.js';

/**
 * Extended database with repositories attached
 *
 * @deprecated Use repository functions directly with singleton pattern instead
 */
export type DeepFundingPortalDbWithRepos = DeepFundingPortalDb & {
  rounds: typeof roundsRepo;
  pools: typeof poolsRepo;
  proposals: typeof proposalsRepo;
  users: typeof usersRepo;
  milestones: typeof milestonesRepo;
  reviews: typeof reviewsRepo;
  comments: typeof commentsRepo;
  commentVotes: typeof commentVotesRepo;
};

/**
 * Attach repositories to a database instance
 *
 * @deprecated Use repository functions directly with singleton pattern instead. Initialize database with initializeDb() from db module.
 */
export function attachRepos(db: DeepFundingPortalDb): DeepFundingPortalDbWithRepos {
  return {
    ...db,
    rounds: roundsRepo,
    pools: poolsRepo,
    proposals: proposalsRepo,
    users: usersRepo,
    milestones: milestonesRepo,
    reviews: reviewsRepo,
    comments: commentsRepo,
    commentVotes: commentVotesRepo,
  };
}
