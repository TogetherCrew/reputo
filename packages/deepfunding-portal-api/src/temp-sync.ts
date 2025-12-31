/**
 * Temporary script to sync all DeepFunding Portal data to S3 and SQLite.
 *
 * Strategy:
 * - Fetch and store all rounds → for each round, fetch and store all proposals
 * - Fetch and store all pools
 * - Fetch and store all milestones (paginated)
 * - Fetch and store all reviews (paginated)
 * - Fetch and store all comments (paginated)
 * - Fetch and store all comment_votes (paginated)
 * - Fetch and store all users (paginated)
 *
 * S3 Storage:
 * - Non-paginated: snapshots/{id}/raw/{resource}/all.json
 * - Proposals: snapshots/{id}/raw/proposals/round_{roundId}.json
 * - Paginated: snapshots/{id}/raw/{resource}/page_{n}.json
 *
 * Data Types:
 * - All IDs are integers (comment_id, review_id, milestone.id, etc.)
 * - Numeric fields: Pool.max_funding_amount and Milestone.budget are numbers
 * - All data is normalized and stored according to the updated database schemas
 */

import { S3Client } from '@aws-sdk/client-s3';
import { Storage } from '@reputo/storage';
import { createDeepFundingClient, type DeepFundingClient } from './api/client.js';
import { closeDb, initializeDb } from './db/client.js';
import { fetchComments } from './resources/comments/api.js';
import { commentsRepo } from './resources/comments/repository.js';
import { fetchCommentVotes } from './resources/commentVotes/api.js';
import { commentVotesRepo } from './resources/commentVotes/repository.js';
import { fetchMilestones } from './resources/milestones/api.js';
import { milestonesRepo } from './resources/milestones/repository.js';
import { fetchPools } from './resources/pools/api.js';
import { poolsRepo } from './resources/pools/repository.js';
import { fetchProposals } from './resources/proposals/api.js';
import { proposalsRepo } from './resources/proposals/repository.js';
import { fetchReviews } from './resources/reviews/api.js';
import { reviewsRepo } from './resources/reviews/repository.js';
import { fetchRounds } from './resources/rounds/api.js';
import { roundsRepo } from './resources/rounds/repository.js';
import { fetchUsers } from './resources/users/api.js';
import { usersRepo } from './resources/users/repository.js';

// ============================================================================
// Configuration (hardcoded as requested)
// ============================================================================

const CONFIG = {
  api: {
    baseUrl: 'https://deepfunding.ai/wp-json/deepfunding/v1',
    apiKey: '', // Replace with actual API key
  },
  s3: {
    bucket: 'reputo-staging', // Replace with actual bucket
    region: 'eu-central-1',
    // Optional: for local development with MinIO or similar
    // endpoint: 'http://localhost:9000',
    // forcePathStyle: true,
  },
  db: {
    path: './deepfunding-sync.db',
  },
  pagination: {
    pageLimit: 500,
  },
};

// ============================================================================
// Types
// ============================================================================

type SyncContext = {
  client: DeepFundingClient;
  storage: Storage;
  snapshotId: string;
};

// ============================================================================
// S3 Key Helpers
// ============================================================================

function makeS3Key(snapshotId: string, resource: string, filename: string): string {
  return `snapshots/${snapshotId}/raw/${resource}/${filename}`;
}

// ============================================================================
// Non-Paginated Resource Sync Functions
// ============================================================================

/**
 * Sync all rounds to S3 and SQLite
 */
async function syncRounds(ctx: SyncContext): Promise<number[]> {
  console.log('[rounds] Fetching all rounds...');
  const rounds = await fetchRounds(ctx.client);
  console.log(`[rounds] Fetched ${rounds.length} rounds`);

  // Store raw response in S3
  const s3Key = makeS3Key(ctx.snapshotId, 'rounds', 'all.json');
  await ctx.storage.putObject(s3Key, JSON.stringify(rounds, null, 2), 'application/json');
  console.log(`[rounds] Stored raw response to S3: ${s3Key}`);

  // Store in SQLite
  if (rounds.length > 0) {
    roundsRepo.createMany(rounds);
    console.log(`[rounds] Inserted ${rounds.length} rounds into SQLite`);
  }

  return rounds.map((r) => r.id);
}

/**
 * Sync proposals for all rounds to S3 and SQLite
 */
async function syncProposals(ctx: SyncContext, roundIds: number[]): Promise<void> {
  console.log(`[proposals] Fetching proposals for ${roundIds.length} rounds...`);

  for (const roundId of roundIds) {
    console.log(`[proposals] Fetching proposals for round ${roundId}...`);
    const proposals = await fetchProposals(ctx.client, roundId);
    console.log(`[proposals] Fetched ${proposals.length} proposals for round ${roundId}`);

    // Store raw response in S3 (one file per round)
    const s3Key = makeS3Key(ctx.snapshotId, 'proposals', `round_${roundId}.json`);
    await ctx.storage.putObject(s3Key, JSON.stringify(proposals, null, 2), 'application/json');
    console.log(`[proposals] Stored raw response to S3: ${s3Key}`);

    // Store in SQLite with round_id attached
    if (proposals.length > 0) {
      const proposalsWithRound = proposals.map((p) => ({
        ...p,
        round_id: roundId,
      }));
      proposalsRepo.createMany(proposalsWithRound);
      console.log(`[proposals] Inserted ${proposals.length} proposals for round ${roundId} into SQLite`);
    }
  }
}

/**
 * Sync all pools to S3 and SQLite
 */
async function syncPools(ctx: SyncContext): Promise<void> {
  console.log('[pools] Fetching all pools...');
  const pools = await fetchPools(ctx.client);
  console.log(`[pools] Fetched ${pools.length} pools`);

  // Store raw response in S3
  const s3Key = makeS3Key(ctx.snapshotId, 'pools', 'all.json');
  await ctx.storage.putObject(s3Key, JSON.stringify(pools, null, 2), 'application/json');
  console.log(`[pools] Stored raw response to S3: ${s3Key}`);

  // Store in SQLite
  if (pools.length > 0) {
    poolsRepo.createMany(pools);
    console.log(`[pools] Inserted ${pools.length} pools into SQLite`);
  }
}

// ============================================================================
// Paginated Resource Sync Functions
// ============================================================================

/**
 * Sync all milestones (paginated) to S3 and SQLite
 */
async function syncMilestones(ctx: SyncContext): Promise<void> {
  console.log('[milestones] Fetching all milestones (paginated)...');
  let pageNum = 1;
  let totalCount = 0;

  for await (const page of fetchMilestones(ctx.client, {
    limit: CONFIG.pagination.pageLimit,
  })) {
    console.log(`[milestones] Page ${pageNum}: ${page.data.length} items`);

    // Store raw page response in S3
    const s3Key = makeS3Key(ctx.snapshotId, 'milestones', `page_${pageNum}.json`);
    await ctx.storage.putObject(
      s3Key,
      JSON.stringify({ data: page.data, pagination: page.pagination }, null, 2),
      'application/json',
    );
    console.log(`[milestones] Stored page ${pageNum} to S3: ${s3Key}`);

    // Store in SQLite
    if (page.data.length > 0) {
      milestonesRepo.createMany(page.data);
    }

    totalCount += page.data.length;
    pageNum++;
  }

  console.log(`[milestones] Total: ${totalCount} milestones across ${pageNum - 1} pages`);
}

/**
 * Sync all reviews (paginated) to S3 and SQLite
 */
async function syncReviews(ctx: SyncContext): Promise<void> {
  console.log('[reviews] Fetching all reviews (paginated)...');
  let pageNum = 1;
  let totalCount = 0;

  for await (const page of fetchReviews(ctx.client, {
    limit: CONFIG.pagination.pageLimit,
  })) {
    console.log(`[reviews] Page ${pageNum}: ${page.data.length} items`);

    // Store raw page response in S3
    const s3Key = makeS3Key(ctx.snapshotId, 'reviews', `page_${pageNum}.json`);
    await ctx.storage.putObject(
      s3Key,
      JSON.stringify({ data: page.data, pagination: page.pagination }, null, 2),
      'application/json',
    );
    console.log(`[reviews] Stored page ${pageNum} to S3: ${s3Key}`);

    // Store in SQLite
    if (page.data.length > 0) {
      reviewsRepo.createMany(page.data);
    }

    totalCount += page.data.length;
    pageNum++;
  }

  console.log(`[reviews] Total: ${totalCount} reviews across ${pageNum - 1} pages`);
}

/**
 * Sync all comments (paginated) to S3 and SQLite
 */
async function syncComments(ctx: SyncContext): Promise<void> {
  console.log('[comments] Fetching all comments (paginated)...');
  let pageNum = 1;
  let totalCount = 0;

  for await (const page of fetchComments(ctx.client, {
    limit: CONFIG.pagination.pageLimit,
  })) {
    console.log(`[comments] Page ${pageNum}: ${page.data.length} items`);

    // Store raw page response in S3
    const s3Key = makeS3Key(ctx.snapshotId, 'comments', `page_${pageNum}.json`);
    await ctx.storage.putObject(
      s3Key,
      JSON.stringify({ data: page.data, pagination: page.pagination }, null, 2),
      'application/json',
    );
    console.log(`[comments] Stored page ${pageNum} to S3: ${s3Key}`);

    // Store in SQLite
    if (page.data.length > 0) {
      commentsRepo.createMany(page.data);
    }

    totalCount += page.data.length;
    pageNum++;
  }

  console.log(`[comments] Total: ${totalCount} comments across ${pageNum - 1} pages`);
}

/**
 * Sync all comment votes (paginated) to S3 and SQLite
 */
async function syncCommentVotes(ctx: SyncContext): Promise<void> {
  console.log('[comment_votes] Fetching all comment votes (paginated)...');
  let pageNum = 1;
  let totalCount = 0;

  for await (const page of fetchCommentVotes(ctx.client, {
    limit: CONFIG.pagination.pageLimit,
  })) {
    console.log(`[comment_votes] Page ${pageNum}: ${page.data.length} items`);

    // Store raw page response in S3
    const s3Key = makeS3Key(ctx.snapshotId, 'comment_votes', `page_${pageNum}.json`);
    await ctx.storage.putObject(
      s3Key,
      JSON.stringify({ data: page.data, pagination: page.pagination }, null, 2),
      'application/json',
    );
    console.log(`[comment_votes] Stored page ${pageNum} to S3: ${s3Key}`);

    // Store in SQLite
    if (page.data.length > 0) {
      commentVotesRepo.createMany(page.data);
    }

    totalCount += page.data.length;
    pageNum++;
  }

  console.log(`[comment_votes] Total: ${totalCount} comment votes across ${pageNum - 1} pages`);
}

/**
 * Sync all users (paginated) to S3 and SQLite
 */
async function syncUsers(ctx: SyncContext): Promise<void> {
  console.log('[users] Fetching all users (paginated)...');
  let pageNum = 1;
  let totalCount = 0;

  for await (const page of fetchUsers(ctx.client, {
    limit: CONFIG.pagination.pageLimit,
  })) {
    console.log(`[users] Page ${pageNum}: ${page.data.length} items`);

    // Store raw page response in S3
    const s3Key = makeS3Key(ctx.snapshotId, 'users', `page_${pageNum}.json`);
    await ctx.storage.putObject(
      s3Key,
      JSON.stringify({ data: page.data, pagination: page.pagination }, null, 2),
      'application/json',
    );
    console.log(`[users] Stored page ${pageNum} to S3: ${s3Key}`);

    // Store in SQLite
    if (page.data.length > 0) {
      usersRepo.createMany(page.data);
    }

    totalCount += page.data.length;
    pageNum++;
  }

  console.log(`[users] Total: ${totalCount} users across ${pageNum - 1} pages`);
}

// ============================================================================
// Main Orchestration
// ============================================================================

async function syncAll(): Promise<void> {
  const snapshotId = crypto.randomUUID();
  console.log(`\n========================================`);
  console.log(`Starting DeepFunding Portal sync`);
  console.log(`Snapshot ID: ${snapshotId}`);
  console.log(`========================================\n`);

  // Initialize S3 client
  const s3Client = new S3Client({
    region: CONFIG.s3.region,
    credentials: {
      accessKeyId: 'x',
      secretAccessKey: 'x/x+x',
    },
  });

  // Initialize Storage wrapper
  const storage = new Storage(
    {
      bucket: CONFIG.s3.bucket,
      presignPutTtl: 3600,
      presignGetTtl: 900,
      maxSizeBytes: 500 * 1024 * 1024, // 500 MB
      contentTypeAllowlist: ['application/json'],
    },
    s3Client,
  );

  // Initialize API client
  const client = createDeepFundingClient({
    baseUrl: CONFIG.api.baseUrl,
    apiKey: CONFIG.api.apiKey,
  });

  // Initialize SQLite database
  initializeDb({ path: CONFIG.db.path });
  console.log(`Initialized SQLite database at: ${CONFIG.db.path}\n`);

  const ctx: SyncContext = { client, storage, snapshotId };

  try {
    // ============================
    // Non-paginated resources
    // ============================

    // 1. Fetch and store all rounds
    const roundIds = await syncRounds(ctx);
    console.log('');

    // 2. For each round, fetch and store proposals
    await syncProposals(ctx, roundIds);
    console.log('');

    // 3. Fetch and store all pools
    await syncPools(ctx);
    console.log('');

    // ============================
    // Paginated resources
    // ============================

    // 4. Fetch and store all milestones
    await syncMilestones(ctx);
    console.log('');

    // 5. Fetch and store all reviews
    await syncReviews(ctx);
    console.log('');

    // 6. Fetch and store all comments
    await syncComments(ctx);
    console.log('');

    // 7. Fetch and store all comment votes
    await syncCommentVotes(ctx);
    console.log('');

    // 8. Fetch and store all users
    await syncUsers(ctx);
    console.log('');

    console.log(`========================================`);
    console.log(`Sync complete!`);
    console.log(`Snapshot ID: ${snapshotId}`);
    console.log(`S3 prefix: snapshots/${snapshotId}/raw/`);
    console.log(`SQLite DB: ${CONFIG.db.path}`);
    console.log(`========================================\n`);
  } finally {
    // Clean up database connection
    closeDb();
  }
}

// Run the sync
syncAll().catch((error) => {
  console.error('Sync failed:', error);
  closeDb();
  process.exit(1);
});
