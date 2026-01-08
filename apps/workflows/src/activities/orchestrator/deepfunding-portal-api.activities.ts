import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateKey, ObjectNotFoundError } from '@reputo/storage';
import { Context } from '@temporalio/activity';

import type {
  AlgorithmResult,
  DeepFundingSyncInput,
  DeepFundingSyncOutput,
  DeepfundingSyncContext,
  PaginatedResponse,
} from '../../shared/types/index.js';

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

export function createDeepfundingSyncActivity(ctx: DeepfundingSyncContext) {
  const { storage, storageConfig } = ctx;

  return async function deepfunding_sync(input: DeepFundingSyncInput): Promise<AlgorithmResult> {
    const { snapshotId } = input;
    const logger = Context.current().log;

    const { bucket, maxSizeBytes } = storageConfig;

    const dbKey = generateKey('snapshot', snapshotId, 'deepfunding.db');
    const manifestKey = generateKey('snapshot', snapshotId, 'deepfunding/manifest.json');

    try {
      await storage.verify({ bucket, key: dbKey, maxSizeBytes });
      logger.info('DeepFunding snapshot DB already exists; skipping sync', { snapshotId, dbKey });
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

    logger.info('Starting DeepFunding portal sync for snapshot', {
      snapshotId,
      baseUrl,
      requestTimeoutMs,
      concurrency,
      defaultPageLimit,
      retry: {
        maxAttempts: retryMaxAttempts,
        baseDelayMs: retryBaseDelayMs,
        maxDelayMs: retryMaxDelayMs,
      },
    });

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
        storage.putObject({
          bucket,
          key: generateKey('snapshot', snapshotId, 'deepfunding/rounds.json'),
          body: JSON.stringify(rounds),
          contentType: 'application/json',
        }),
        roundsRepo.createMany(rounds),
      ]);

      // 2) Proposals (per round)
      await Promise.all(
        rounds.map(async (round: { id: number }) => {
          const proposals = await fetchProposals(client, round.id);
          await Promise.all([
            storage.putObject({
              bucket,
              key: generateKey('snapshot', snapshotId, `deepfunding/proposals/round_${round.id}.json`),
              body: JSON.stringify(proposals),
              contentType: 'application/json',
            }),
            proposalsRepo.createMany(
              // biome-ignore lint/suspicious/noExplicitAny: External API type
              (proposals as any[]).map((p: any) => ({
                ...p,
                round_id: round.id,
              })),
            ),
          ]);
        }),
      );

      // 3) Pools
      const pools = await fetchPools(client);
      await Promise.all([
        storage.putObject({
          bucket,
          key: generateKey('snapshot', snapshotId, 'deepfunding/pools.json'),
          body: JSON.stringify(pools),
          contentType: 'application/json',
        }),
        poolsRepo.createMany(pools),
      ]);

      // 4) Milestones (paginated)
      for await (const page of fetchMilestones(client)) {
        const typedPage = page as PaginatedResponse;
        const pageNumber = typedPage.pagination?.current_page ?? 'unknown';
        await Promise.all([
          storage.putObject({
            bucket,
            key: generateKey('snapshot', snapshotId, `deepfunding/milestones/page_${pageNumber}.json`),
            body: JSON.stringify(page),
            contentType: 'application/json',
          }),
          milestonesRepo.createMany(typedPage.data),
        ]);
      }

      // 5) Reviews (paginated)
      for await (const page of fetchReviews(client)) {
        const typedPage = page as PaginatedResponse;
        const pageNumber = typedPage.pagination?.current_page ?? 'unknown';
        await Promise.all([
          storage.putObject({
            bucket,
            key: generateKey('snapshot', snapshotId, `deepfunding/reviews/page_${pageNumber}.json`),
            body: JSON.stringify(page),
            contentType: 'application/json',
          }),
          reviewsRepo.createMany(typedPage.data),
        ]);
      }

      // 6) Comments (paginated)
      for await (const page of fetchComments(client)) {
        const typedPage = page as PaginatedResponse;
        const pageNumber = typedPage.pagination?.current_page ?? 'unknown';
        await Promise.all([
          storage.putObject({
            bucket,
            key: generateKey('snapshot', snapshotId, `deepfunding/comments/page_${pageNumber}.json`),
            body: JSON.stringify(page),
            contentType: 'application/json',
          }),
          commentsRepo.createMany(typedPage.data),
        ]);
      }

      // 7) Comment votes (paginated)
      for await (const page of fetchCommentVotes(client)) {
        const typedPage = page as PaginatedResponse;
        const pageNumber = typedPage.pagination?.current_page ?? 'unknown';
        await Promise.all([
          storage.putObject({
            bucket,
            key: generateKey('snapshot', snapshotId, `deepfunding/comment_votes/page_${pageNumber}.json`),
            body: JSON.stringify(page),
            contentType: 'application/json',
          }),
          commentVotesRepo.createMany(typedPage.data),
        ]);
      }

      // 8) Users (paginated)
      for await (const page of fetchUsers(client)) {
        const typedPage = page as PaginatedResponse;
        const pageNumber = typedPage.pagination?.current_page ?? 'unknown';
        await Promise.all([
          storage.putObject({
            bucket,
            key: generateKey('snapshot', snapshotId, `deepfunding/users/page_${pageNumber}.json`),
            body: JSON.stringify(page),
            contentType: 'application/json',
          }),
          usersRepo.createMany(typedPage.data),
        ]);
      }

      // Upload SQLite DB
      const dbBytes = await readFile(localDbPath);
      await storage.putObject({
        bucket,
        key: dbKey,
        body: dbBytes,
        contentType: 'application/x-sqlite3',
      });

      // Write manifest marker
      const manifest = {
        snapshotId,
        startedAt,
        completedAt: new Date().toISOString(),
        dbKey,
        rawPrefix: generateKey('snapshot', snapshotId, 'deepfunding/'),
      };
      await storage.putObject({
        bucket,
        key: manifestKey,
        body: JSON.stringify(manifest),
        contentType: 'application/json',
      });

      logger.info('DeepFunding portal sync completed', {
        snapshotId,
        dbKey,
        manifestKey,
      });

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
  };
}
