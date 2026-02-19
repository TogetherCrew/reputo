import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateKey, ObjectNotFoundError } from '@reputo/storage';
import { Context } from '@temporalio/activity';
import config from '../../config/index.js';
import type {
  AlgorithmResult,
  DeepFundingSyncInput,
  DeepFundingSyncOutput,
  DeepfundingSyncContext,
  PaginatedResponse,
} from '../../shared/types/index.js';

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

    const baseUrl = config.deepfundingPortalApi.apiBaseUrl;
    const apiKey = config.deepfundingPortalApi.apiKey;
    const requestTimeoutMs = config.deepfundingPortalApi.requestTimeoutMs;
    const concurrency = config.deepfundingPortalApi.concurrency;
    const defaultPageLimit = config.deepfundingPortalApi.defaultPageLimit;
    const retryMaxAttempts = config.deepfundingPortalApi.retryMaxAttempts;
    const retryBaseDelayMs = config.deepfundingPortalApi.retryBaseDelayMs;
    const retryMaxDelayMs = config.deepfundingPortalApi.retryMaxDelayMs;

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
      createDb,
      closeDbInstance,
      createRepos,
      createDeepFundingClient,
      fetchComments,
      fetchCommentVotes,
      fetchMilestones,
      fetchPools,
      fetchProposals,
      fetchReviews,
      fetchRounds,
      fetchUsers,
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

    const db = createDb({ path: localDbPath });
    const repos = createRepos(db);

    try {
      // 1) Rounds
      const rounds = await fetchRounds(client);
      await Promise.all([
        storage.putObject({
          bucket,
          key: generateKey('snapshot', snapshotId, 'deepfunding/rounds.json'),
          body: JSON.stringify(rounds),
          contentType: 'application/json',
        }),
        repos.rounds.createMany(rounds),
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
            repos.proposals.createMany(
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
        repos.pools.createMany(pools),
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
          repos.milestones.createMany(typedPage.data),
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
          repos.reviews.createMany(typedPage.data),
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
          repos.comments.createMany(typedPage.data),
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
          repos.commentVotes.createMany(typedPage.data),
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
          repos.users.createMany(typedPage.data),
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
        closeDbInstance(db);
      } catch {
        // ignore
      }
      await rm(tempDir, { recursive: true, force: true });
    }
  };
}
