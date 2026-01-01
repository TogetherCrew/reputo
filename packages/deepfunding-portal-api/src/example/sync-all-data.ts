#!/usr/bin/env tsx
/**
 * DeepFunding Portal Data Sync Script
 *
 * Fetches all data from the DeepFunding Portal API and stores it to:
 * - S3: JSON snapshots organized by resource type
 * - SQLite: Normalized database for querying
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
 * Usage:
 *   pnpm tsx src/example/sync-all-data.ts
 */

import { randomUUID } from 'node:crypto';
import { S3Client } from '@aws-sdk/client-s3';
import { generateKey, Storage } from '@reputo/storage';
import { closeDb, initializeDb } from '../db/client.js';
import {
  createDeepFundingClient,
  fetchComments,
  fetchCommentVotes,
  fetchMilestones,
  fetchPools,
  fetchProposals,
  fetchReviews,
  fetchRounds,
  fetchUsers,
} from '../index.js';
import { commentsRepo } from '../resources/comments/repository.js';
import { commentVotesRepo } from '../resources/commentVotes/repository.js';
import { milestonesRepo } from '../resources/milestones/repository.js';
import { poolsRepo } from '../resources/pools/repository.js';
import { proposalsRepo } from '../resources/proposals/repository.js';
import { reviewsRepo } from '../resources/reviews/repository.js';
import { roundsRepo } from '../resources/rounds/repository.js';
import { usersRepo } from '../resources/users/repository.js';
import { API_CONFIG, S3_CONFIG, SQLITE_CONFIG } from './config.js';

/**
 * Main sync function
 */
async function main(): Promise<void> {
  const snapshotId = randomUUID();
  console.log(`[sync] Starting sync: ${snapshotId}`);

  const storage = new Storage(
    {
      bucket: S3_CONFIG.bucket,
      presignPutTtl: S3_CONFIG.presignPutTtl,
      presignGetTtl: S3_CONFIG.presignGetTtl,
      maxSizeBytes: S3_CONFIG.maxSizeBytes,
      contentTypeAllowlist: [...S3_CONFIG.contentTypeAllowlist],
    },
    new S3Client({
      region: S3_CONFIG.region,
      credentials: S3_CONFIG.credentials,
    }),
  );

  initializeDb({ path: SQLITE_CONFIG.path });

  const apiClient = createDeepFundingClient({
    baseUrl: API_CONFIG.baseUrl,
    apiKey: API_CONFIG.apiKey,
    requestTimeoutMs: API_CONFIG.requestTimeoutMs,
    concurrency: API_CONFIG.concurrency,
    retry: API_CONFIG.retry,
    defaultPageLimit: API_CONFIG.defaultPageLimit,
  });

  try {
    // 1. Rounds
    const rounds = await fetchRounds(apiClient);
    await Promise.all([
      storage.putObject(generateKey('snapshot', snapshotId, 'rounds.json'), JSON.stringify(rounds), 'application/json'),
      roundsRepo.createMany(rounds),
    ]);

    // 2. Proposals
    await Promise.all(
      rounds.map(async (round) => {
        const proposals = await fetchProposals(apiClient, round.id);
        await Promise.all([
          storage.putObject(
            generateKey('snapshot', snapshotId, `proposals_round_${round.id}.json`),
            JSON.stringify(proposals),
            'application/json',
          ),
          proposalsRepo.createMany(proposals.map((p) => ({ ...p, round_id: round.id }))),
        ]);
      }),
    );

    // 3. Pools
    const pools = await fetchPools(apiClient);
    await Promise.all([
      storage.putObject(generateKey('snapshot', snapshotId, 'pools.json'), JSON.stringify(pools), 'application/json'),
      poolsRepo.createMany(pools),
    ]);

    // 4. Milestones
    for await (const page of fetchMilestones(apiClient)) {
      await Promise.all([
        storage.putObject(
          generateKey('snapshot', snapshotId, `milestones_page_${page.pagination.current_page}.json`),
          JSON.stringify(page),
          'application/json',
        ),
        milestonesRepo.createMany(page.data),
      ]);
    }

    // 5. Reviews
    for await (const page of fetchReviews(apiClient)) {
      await Promise.all([
        storage.putObject(
          generateKey('snapshot', snapshotId, `reviews_page_${page.pagination.current_page}.json`),
          JSON.stringify(page),
          'application/json',
        ),
        reviewsRepo.createMany(page.data),
      ]);
    }

    // 6. Comments
    for await (const page of fetchComments(apiClient)) {
      await Promise.all([
        storage.putObject(
          generateKey('snapshot', snapshotId, `comments_page_${page.pagination.current_page}.json`),
          JSON.stringify(page),
          'application/json',
        ),
        commentsRepo.createMany(page.data),
      ]);
    }

    // 7. Comment votes
    for await (const page of fetchCommentVotes(apiClient)) {
      await Promise.all([
        storage.putObject(
          generateKey('snapshot', snapshotId, `comment_votes_page_${page.pagination.current_page}.json`),
          JSON.stringify(page),
          'application/json',
        ),
        commentVotesRepo.createMany(page.data),
      ]);
    }

    // 8. Users
    for await (const page of fetchUsers(apiClient)) {
      await Promise.all([
        storage.putObject(
          generateKey('snapshot', snapshotId, `users_page_${page.pagination.current_page}.json`),
          JSON.stringify(page),
          'application/json',
        ),
        usersRepo.createMany(page.data),
      ]);
    }
    console.log('[sync] Sync completed');
  } finally {
    closeDb();
  }
}

// Run the sync
main().catch((error) => {
  console.error('[sync] Fatal error:', error);
  process.exit(1);
});
