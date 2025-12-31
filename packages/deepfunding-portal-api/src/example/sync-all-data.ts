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
import { createDeepFundingClient } from '../api/client.js';
import { closeDb, initializeDb } from '../db/client.js';
import { fetchComments } from '../resources/comments/api.js';
import { commentsRepo } from '../resources/comments/repository.js';
import { fetchCommentVotes } from '../resources/commentVotes/api.js';
import { commentVotesRepo } from '../resources/commentVotes/repository.js';
import { fetchMilestones } from '../resources/milestones/api.js';
import { milestonesRepo } from '../resources/milestones/repository.js';
import { fetchPools } from '../resources/pools/api.js';
import { poolsRepo } from '../resources/pools/repository.js';
import { fetchProposals } from '../resources/proposals/api.js';
import { proposalsRepo } from '../resources/proposals/repository.js';
import { fetchReviews } from '../resources/reviews/api.js';
import { reviewsRepo } from '../resources/reviews/repository.js';
import { fetchRounds } from '../resources/rounds/api.js';
import { roundsRepo } from '../resources/rounds/repository.js';
import { fetchUsers } from '../resources/users/api.js';
import { usersRepo } from '../resources/users/repository.js';
import { API_CONFIG, LOG_CONFIG, S3_CONFIG, SQLITE_CONFIG } from './config.js';
import { createStorage, storeNonPaginated, storePaginatedPage, storeProposalsForRound } from './storage-helpers.js';

/**
 * Logger utility
 */
function log(message: string, data?: unknown): void {
  if (LOG_CONFIG.verbose) {
    if (data !== undefined) {
      console.log(`[sync] ${message}`, data);
    } else {
      console.log(`[sync] ${message}`);
    }
  }
}

/**
 * Main sync function
 */
async function main(): Promise<void> {
  // Generate unique snapshot ID for this run
  const snapshotId = randomUUID();
  log(`Starting sync with snapshot ID: ${snapshotId}`);

  // Initialize S3 client
  log('Initializing S3 client...');
  const s3Client = new S3Client({
    region: S3_CONFIG.region,
    credentials: S3_CONFIG.credentials,
  });
  const storage = createStorage(s3Client);

  // Initialize SQLite database
  log(`Initializing SQLite database at: ${SQLITE_CONFIG.path}`);
  initializeDb({ path: SQLITE_CONFIG.path });

  // Initialize DeepFunding API client
  log('Initializing DeepFunding API client...');
  const apiClient = createDeepFundingClient({
    baseUrl: API_CONFIG.baseUrl,
    apiKey: API_CONFIG.apiKey,
    requestTimeoutMs: API_CONFIG.requestTimeoutMs,
    concurrency: API_CONFIG.concurrency,
    retry: API_CONFIG.retry,
    defaultPageLimit: API_CONFIG.defaultPageLimit,
  });

  try {
    // ==========================================
    // 1. Fetch and store rounds + proposals
    // ==========================================
    log('Fetching rounds...');
    const rounds = await fetchRounds(apiClient);
    log(`Fetched ${rounds.length} rounds`);

    // Store rounds to S3
    const roundsKey = await storeNonPaginated(storage, snapshotId, 'rounds', rounds);
    log(`Stored rounds to S3: ${roundsKey}`);

    // Store rounds to SQLite
    roundsRepo.createMany(rounds);
    log('Stored rounds to SQLite');

    // Fetch and store proposals for each round
    let totalProposals = 0;
    for (const round of rounds) {
      log(`Fetching proposals for round ${round.id} (${round.name})...`);
      const proposals = await fetchProposals(apiClient, round.id);
      log(`Fetched ${proposals.length} proposals for round ${round.id}`);

      // Store proposals to S3
      const proposalsKey = await storeProposalsForRound(storage, snapshotId, round.id, proposals);
      log(`Stored proposals to S3: ${proposalsKey}`);

      // Store proposals to SQLite (add round_id for normalization)
      if (proposals.length > 0) {
        const proposalsWithRound = proposals.map((p) => ({
          ...p,
          round_id: round.id,
        }));
        proposalsRepo.createMany(proposalsWithRound);
        log(`Stored ${proposals.length} proposals to SQLite`);
        totalProposals += proposals.length;
      }
    }

    // ==========================================
    // 2. Fetch and store pools
    // ==========================================
    log('Fetching pools...');
    const pools = await fetchPools(apiClient);
    log(`Fetched ${pools.length} pools`);

    // Store pools to S3
    const poolsKey = await storeNonPaginated(storage, snapshotId, 'pools', pools);
    log(`Stored pools to S3: ${poolsKey}`);

    // Store pools to SQLite
    poolsRepo.createMany(pools);
    log('Stored pools to SQLite');

    // ==========================================
    // 3. Fetch and store milestones (paginated)
    // ==========================================
    log('Fetching milestones...');
    const allMilestones: Awaited<
      ReturnType<typeof fetchMilestones> extends AsyncGenerator<infer T> ? T : never
    >['data'] = [];
    let milestonePage = 0;
    let milestonesTotal = 0;
    for await (const page of fetchMilestones(apiClient)) {
      milestonePage++;
      allMilestones.push(...page.data);
      milestonesTotal = page.pagination.total_records;
      log(
        `Milestones page ${milestonePage}/${page.pagination.total_pages}: ` +
          `${page.data.length} items (running total: ${allMilestones.length}/${milestonesTotal})`,
      );

      // Store page to S3
      const pageKey = await storePaginatedPage(storage, snapshotId, 'milestones', milestonePage, page.data);
      log(`Stored milestones page to S3: ${pageKey}`);
    }

    // Store all milestones to SQLite
    let milestonesStored = 0;
    if (allMilestones.length > 0) {
      milestonesRepo.createMany(allMilestones);
      milestonesStored = allMilestones.length;
      log(`Stored ${milestonesStored} milestones to SQLite`);
    }

    // ==========================================
    // 4. Fetch and store reviews (paginated)
    // ==========================================
    log('Fetching reviews...');
    const allReviews: Awaited<ReturnType<typeof fetchReviews> extends AsyncGenerator<infer T> ? T : never>['data'] = [];
    let reviewPage = 0;
    let reviewsTotal = 0;
    for await (const page of fetchReviews(apiClient)) {
      reviewPage++;
      allReviews.push(...page.data);
      reviewsTotal = page.pagination.total_records;
      log(
        `Reviews page ${reviewPage}/${page.pagination.total_pages}: ` +
          `${page.data.length} items (running total: ${allReviews.length}/${reviewsTotal})`,
      );

      // Store page to S3
      const pageKey = await storePaginatedPage(storage, snapshotId, 'reviews', reviewPage, page.data);
      log(`Stored reviews page to S3: ${pageKey}`);
    }

    // Store all reviews to SQLite
    let reviewsStored = 0;
    if (allReviews.length > 0) {
      reviewsRepo.createMany(allReviews);
      reviewsStored = allReviews.length;
      log(`Stored ${reviewsStored} reviews to SQLite`);
    }

    // ==========================================
    // 5. Fetch and store comments (paginated)
    // ==========================================
    log('Fetching comments...');
    const allComments: Awaited<ReturnType<typeof fetchComments> extends AsyncGenerator<infer T> ? T : never>['data'] =
      [];
    let commentPage = 0;
    let commentsApiTotal = 0;
    for await (const page of fetchComments(apiClient)) {
      commentPage++;
      allComments.push(...page.data);
      commentsApiTotal = page.pagination.total_records;
      log(
        `Comments page ${commentPage}/${page.pagination.total_pages}: ` +
          `${page.data.length} items (running total: ${allComments.length}/${commentsApiTotal})`,
      );

      // Store page to S3
      const pageKey = await storePaginatedPage(storage, snapshotId, 'comments', commentPage, page.data);
      log(`Stored comments page to S3: ${pageKey}`);
    }

    // Store all comments to SQLite
    let commentsStored = 0;
    if (allComments.length > 0) {
      commentsRepo.createMany(allComments);
      commentsStored = allComments.length;
      log(`Stored ${commentsStored} comments to SQLite`);
    }

    // ==========================================
    // 6. Fetch and store comment_votes (paginated)
    // ==========================================
    log('Fetching comment votes...');
    const allCommentVotes: Awaited<
      ReturnType<typeof fetchCommentVotes> extends AsyncGenerator<infer T> ? T : never
    >['data'] = [];
    let commentVotePage = 0;
    let commentVotesTotal = 0;
    for await (const page of fetchCommentVotes(apiClient)) {
      commentVotePage++;
      allCommentVotes.push(...page.data);
      commentVotesTotal = page.pagination.total_records;
      log(
        `Comment votes page ${commentVotePage}/${page.pagination.total_pages}: ` +
          `${page.data.length} items (running total: ${allCommentVotes.length}/${commentVotesTotal})`,
      );

      // Store page to S3
      const pageKey = await storePaginatedPage(storage, snapshotId, 'comment_votes', commentVotePage, page.data);
      log(`Stored comment votes page to S3: ${pageKey}`);
    }

    // Store all comment votes to SQLite
    let commentVotesStored = 0;
    if (allCommentVotes.length > 0) {
      commentVotesRepo.createMany(allCommentVotes);
      commentVotesStored = allCommentVotes.length;
      log(`Stored ${commentVotesStored} comment votes to SQLite`);
    }

    // ==========================================
    // 7. Fetch and store users (paginated)
    // ==========================================
    log('Fetching users...');
    const allUsers: Awaited<ReturnType<typeof fetchUsers> extends AsyncGenerator<infer T> ? T : never>['data'] = [];
    let userPage = 0;
    let usersApiTotal = 0;
    for await (const page of fetchUsers(apiClient)) {
      userPage++;
      allUsers.push(...page.data);
      usersApiTotal = page.pagination.total_records;
      log(
        `Users page ${userPage}/${page.pagination.total_pages}: ` +
          `${page.data.length} items (running total: ${allUsers.length}/${usersApiTotal})`,
      );

      // Store page to S3
      const pageKey = await storePaginatedPage(storage, snapshotId, 'users', userPage, page.data);
      log(`Stored users page to S3: ${pageKey}`);
    }

    // Store all users to SQLite
    let usersStored = 0;
    if (allUsers.length > 0) {
      usersRepo.createMany(allUsers);
      usersStored = allUsers.length;
      log(`Stored ${usersStored} users to SQLite`);
    }

    // ==========================================
    // Summary
    // ==========================================
    log('='.repeat(50));
    log('Sync completed successfully!');
    log(`Snapshot ID: ${snapshotId}`);
    log('Summary:', {
      rounds: {
        fetched: rounds.length,
        stored: rounds.length,
      },
      proposals: {
        fetched: totalProposals,
        stored: totalProposals,
      },
      pools: {
        fetched: pools.length,
        stored: pools.length,
      },
      milestones: {
        fetched: milestonesTotal,
        stored: milestonesStored,
      },
      reviews: {
        fetched: reviewsTotal,
        stored: reviewsStored,
      },
      comments: {
        fetched: allComments.length,
        stored: commentsStored,
        apiTotal: commentsApiTotal,
      },
      commentVotes: {
        fetched: commentVotesTotal,
        stored: commentVotesStored,
      },
      users: {
        fetched: allUsers.length,
        stored: usersStored,
        apiTotal: usersApiTotal,
      },
    });
    log(`S3 snapshot location: snapshots/${snapshotId}/`);
    log(`SQLite database: ${SQLITE_CONFIG.path}`);
  } finally {
    // Clean up
    closeDb();
    log('Database connection closed');
  }
}

// Run the sync
main().catch((error) => {
  console.error('[sync] Fatal error:', error);
  process.exit(1);
});
