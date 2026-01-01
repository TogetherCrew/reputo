import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { generateKey, ObjectNotFoundError, type Storage } from '@reputo/storage';
import pino from 'pino';

import type { WorkerAlgorithmResult } from '../types/algorithm.js';

// Extend global type to include storage
declare global {
  // eslint-disable-next-line no-var
  var storage: Storage | undefined;
}

const logger = pino().child({ activity: 'deepfunding-sync' });

export interface DeepFundingSyncInput {
  snapshotId: string;
}

export interface DeepFundingSyncOutput {
  /** S3 key for snapshot-scoped SQLite DB */
  deepfunding_db_key: string;
  /** S3 key for sync manifest marker */
  deepfunding_manifest_key: string;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

function getNumberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Sync DeepFunding Portal data for a snapshot.
 *
 * - Fetches all DeepFunding Portal resources
 * - Stores raw JSON pages to S3 under `snapshots/{snapshotId}/deepfunding/...`
 * - Builds a normalized SQLite DB file locally and uploads it to `snapshots/{snapshotId}/deepfunding.db`
 * - Writes a manifest marker to `snapshots/{snapshotId}/deepfunding/manifest.json`
 *
 * Idempotency:
 * - If `snapshots/{snapshotId}/deepfunding.db` exists, returns immediately.
 */
export async function deepfunding_sync(input: DeepFundingSyncInput): Promise<WorkerAlgorithmResult> {
  const { snapshotId } = input;

  const storage = global.storage;
  if (!storage) {
    throw new Error('Storage instance not initialized. Ensure worker is properly started.');
  }

  const dbKey = generateKey('snapshot', snapshotId, 'deepfunding.db');
  const manifestKey = generateKey('snapshot', snapshotId, 'deepfunding/manifest.json');

  // Fast-path: DB already exists for this snapshot
  try {
    await storage.verify(dbKey);
    logger.info({ snapshotId, dbKey }, 'DeepFunding snapshot DB already exists; skipping sync');
    return {
      outputs: {
        deepfunding_db_key: dbKey,
        deepfunding_manifest_key: manifestKey,
      } satisfies DeepFundingSyncOutput,
    };
  } catch (err) {
    if (!(err instanceof ObjectNotFoundError)) {
      throw err;
    }
  }

  const baseUrl = process.env.DEEPFUNDING_API_BASE_URL || 'https://deepfunding.ai/wp-json/deepfunding/v1';
  const apiKey = getRequiredEnv('DEEPFUNDING_API_KEY');
  const requestTimeoutMs = getNumberEnv('DEEPFUNDING_API_REQUEST_TIMEOUT_MS', 45_000);
  const concurrency = getNumberEnv('DEEPFUNDING_API_CONCURRENCY', 4);
  const defaultPageLimit = getNumberEnv('DEEPFUNDING_API_DEFAULT_PAGE_LIMIT', 500);
  const retryMaxAttempts = getNumberEnv('DEEPFUNDING_API_RETRY_MAX_ATTEMPTS', 7);
  const retryBaseDelayMs = getNumberEnv('DEEPFUNDING_API_RETRY_BASE_DELAY_MS', 500);
  const retryMaxDelayMs = getNumberEnv('DEEPFUNDING_API_RETRY_MAX_DELAY_MS', 20_000);

  logger.info(
    {
      snapshotId,
      baseUrl,
      requestTimeoutMs,
      concurrency,
      defaultPageLimit,
      retry: { maxAttempts: retryMaxAttempts, baseDelayMs: retryBaseDelayMs, maxDelayMs: retryMaxDelayMs },
    },
    'Starting DeepFunding portal sync for snapshot',
  );

  const {
    closeDb,
    initializeDb,
    createDeepFundingClient,
    fetchComments,
    fetchCommentVotes,
    fetchMilestones,
    fetchPools,
    fetchProposals,
    fetchReviews,
    fetchRounds,
    fetchUsers,
    commentsRepo,
    commentVotesRepo,
    milestonesRepo,
    poolsRepo,
    proposalsRepo,
    reviewsRepo,
    roundsRepo,
    usersRepo,
  } = await import('@reputo/deepfunding-portal-api');

  const tempDir = await mkdtemp(join(tmpdir(), `reputo-deepfunding-${snapshotId}-`));
  const localDbPath = join(tempDir, 'deepfunding.db');

  const client = createDeepFundingClient({
    baseUrl,
    apiKey,
    requestTimeoutMs,
    concurrency,
    retry: {
      maxAttempts: retryMaxAttempts,
      baseDelayMs: retryBaseDelayMs,
      maxDelayMs: retryMaxDelayMs,
    },
    defaultPageLimit,
  });

  const startedAt = new Date().toISOString();

  try {
    initializeDb({ path: localDbPath });

    // 1) Rounds
    const rounds = await fetchRounds(client);
    await Promise.all([
      storage.putObject(
        generateKey('snapshot', snapshotId, 'deepfunding/rounds.json'),
        JSON.stringify(rounds),
        'application/json',
      ),
      roundsRepo.createMany(rounds),
    ]);

    // 2) Proposals (per round)
    await Promise.all(
      rounds.map(async (round: { id: number }) => {
        const proposals = await fetchProposals(client, round.id);
        await Promise.all([
          storage.putObject(
            generateKey('snapshot', snapshotId, `deepfunding/proposals/round_${round.id}.json`),
            JSON.stringify(proposals),
            'application/json',
          ),
          // The API returns proposals without round context; attach `round_id` for DB normalization.
          proposalsRepo.createMany((proposals as any[]).map((p) => ({ ...p, round_id: round.id })) as any),
        ]);
      }),
    );

    // 3) Pools
    const pools = await fetchPools(client);
    await Promise.all([
      storage.putObject(
        generateKey('snapshot', snapshotId, 'deepfunding/pools.json'),
        JSON.stringify(pools),
        'application/json',
      ),
      poolsRepo.createMany(pools),
    ]);

    // 4) Milestones (paginated)
    for await (const page of fetchMilestones(client)) {
      const pageNumber = (page as any)?.pagination?.current_page ?? 'unknown';
      await Promise.all([
        storage.putObject(
          generateKey('snapshot', snapshotId, `deepfunding/milestones/page_${pageNumber}.json`),
          JSON.stringify(page),
          'application/json',
        ),
        milestonesRepo.createMany((page as any).data),
      ]);
    }

    // 5) Reviews (paginated)
    for await (const page of fetchReviews(client)) {
      const pageNumber = (page as any)?.pagination?.current_page ?? 'unknown';
      await Promise.all([
        storage.putObject(
          generateKey('snapshot', snapshotId, `deepfunding/reviews/page_${pageNumber}.json`),
          JSON.stringify(page),
          'application/json',
        ),
        reviewsRepo.createMany((page as any).data),
      ]);
    }

    // 6) Comments (paginated)
    for await (const page of fetchComments(client)) {
      const pageNumber = (page as any)?.pagination?.current_page ?? 'unknown';
      await Promise.all([
        storage.putObject(
          generateKey('snapshot', snapshotId, `deepfunding/comments/page_${pageNumber}.json`),
          JSON.stringify(page),
          'application/json',
        ),
        commentsRepo.createMany((page as any).data),
      ]);
    }

    // 7) Comment votes (paginated)
    for await (const page of fetchCommentVotes(client)) {
      const pageNumber = (page as any)?.pagination?.current_page ?? 'unknown';
      await Promise.all([
        storage.putObject(
          generateKey('snapshot', snapshotId, `deepfunding/comment_votes/page_${pageNumber}.json`),
          JSON.stringify(page),
          'application/json',
        ),
        commentVotesRepo.createMany((page as any).data),
      ]);
    }

    // 8) Users (paginated)
    for await (const page of fetchUsers(client)) {
      const pageNumber = (page as any)?.pagination?.current_page ?? 'unknown';
      await Promise.all([
        storage.putObject(
          generateKey('snapshot', snapshotId, `deepfunding/users/page_${pageNumber}.json`),
          JSON.stringify(page),
          'application/json',
        ),
        usersRepo.createMany((page as any).data),
      ]);
    }

    // Upload SQLite DB
    const dbBytes = await readFile(localDbPath);
    await storage.putObject(dbKey, dbBytes, 'application/x-sqlite3');

    // Write manifest marker
    const manifest = {
      snapshotId,
      startedAt,
      completedAt: new Date().toISOString(),
      dbKey,
      rawPrefix: generateKey('snapshot', snapshotId, 'deepfunding/'),
    };
    await storage.putObject(manifestKey, JSON.stringify(manifest), 'application/json');

    logger.info({ snapshotId, dbKey, manifestKey }, 'DeepFunding portal sync completed');

    return {
      outputs: {
        deepfunding_db_key: dbKey,
        deepfunding_manifest_key: manifestKey,
      } satisfies DeepFundingSyncOutput,
    };
  } finally {
    try {
      closeDb();
    } catch {
      // ignore
    }
    await rm(tempDir, { recursive: true, force: true });
  }
}
