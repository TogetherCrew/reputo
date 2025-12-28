/**
 * Resources module for DeepFunding Portal API
 *
 * Each resource contains:
 * - types: Entity-specific type definitions
 * - api: Fetch functions for the resource
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

export * from './comments/api.js';
export { commentsRepo } from './comments/repository.js';
export * from './comments/schema.js';
export type * from './comments/types.js';
export * from './commentVotes/api.js';
export { commentVotesRepo } from './commentVotes/repository.js';
export * from './commentVotes/schema.js';
export type * from './commentVotes/types.js';
export * from './milestones/api.js';
export { milestonesRepo } from './milestones/repository.js';
export * from './milestones/schema.js';
export type * from './milestones/types.js';
export * from './pools/api.js';
export { poolsRepo } from './pools/repository.js';
export * from './pools/schema.js';
export type * from './pools/types.js';
export * from './proposals/api.js';
export { proposalsRepo } from './proposals/repository.js';
export * from './proposals/schema.js';
export type * from './proposals/types.js';
export * from './reviews/api.js';
export { reviewsRepo } from './reviews/repository.js';
export * from './reviews/schema.js';
export type * from './reviews/types.js';
// Re-export API functions
export * from './rounds/api.js';
// Re-export repositories
export { roundsRepo } from './rounds/repository.js';
// Re-export schemas
export * from './rounds/schema.js';
// Re-export types
export type * from './rounds/types.js';
export * from './users/api.js';
export { usersRepo } from './users/repository.js';
export * from './users/schema.js';
export type * from './users/types.js';

/**
 * Extended database with repositories attached
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
