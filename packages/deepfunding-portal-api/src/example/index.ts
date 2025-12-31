/**
 * Example module for DeepFunding Portal data synchronization
 *
 * This module demonstrates how to fetch all data from the DeepFunding Portal API
 * and store it to both S3 (as JSON snapshots) and SQLite database.
 *
 * Files:
 * - config.ts: Hardcoded configuration for API, S3, and SQLite
 * - storage-helpers.ts: S3 upload utilities for paginated/non-paginated data
 * - sync-all-data.ts: Main executable script that performs the full sync
 *
 * Usage:
 *   pnpm tsx src/example/sync-all-data.ts
 *
 * Strategy:
 * 1. Fetch and store all rounds → for each round, fetch and store all proposals
 * 2. Fetch and store all pools
 * 3. Fetch and store all milestones (paginated)
 * 4. Fetch and store all reviews (paginated)
 * 5. Fetch and store all comments (paginated)
 * 6. Fetch and store all comment_votes (paginated)
 * 7. Fetch and store all users (paginated)
 *
 * S3 Storage Structure:
 * - Non-paginated: snapshots/{id}/{resource_name}.json
 * - Paginated: snapshots/{id}/{resource_name}_page_{N}.json
 */

export * from './config.js';
export * from './storage-helpers.js';
