import { rm } from 'node:fs/promises';
import { dirname } from 'node:path';

import { closeDbInstance, createDb, createRepos } from '@reputo/deepfunding-portal-api';
import { generateKey, type Storage } from '@reputo/storage';
import { Context } from '@temporalio/activity';

import config from '../../../../config/index.js';
import { HEARTBEAT_INTERVAL } from '../../../../shared/constants/index.js';
import type { AlgorithmResult, Snapshot } from '../../../../shared/types/index.js';
import { stringifyCsvAsync } from '../../../../shared/utils/index.js';
import { buildCommentBenchmarkRecord, formatBenchmarkOutput } from './benchmark/index.js';
import {
  aggregateVotesByComment,
  calculateBaseScore,
  computeCommentScore,
  computeOwnerBonus,
  computeTimeWeightFromString,
  detectSelfInteraction,
  getVoteStats,
} from './pipeline/index.js';
import type { CommentBenchmarkRecord, ContributionScoreResult } from './types.js';
import { roundScore } from './types.js';
import {
  buildCommentAuthorMap,
  buildProjectOwnerMap,
  buildRelationMap,
  createDeepFundingDb,
  extractInputs,
} from './utils/index.js';

export async function computeContributionScore(snapshot: Snapshot, storage: Storage): Promise<AlgorithmResult> {
  const ctx = Context.current();
  const logger = ctx.log;
  const snapshotId = snapshot._id;

  const params = extractInputs(snapshot.algorithmPresetFrozen.inputs);
  const dbPath = await createDeepFundingDb(snapshotId, storage);
  const db = createDb({ path: dbPath });
  const repos = createRepos(db);

  logger.info('Starting contribution_score algorithm', { snapshotId });
  logger.info('Algorithm parameters', params);

  try {
    const comments = repos.comments.findAll();
    const commentVotes = repos.commentVotes.findAll();
    const proposals = repos.proposals.findAll();
    const users = repos.users.findAll();

    logger.info('Loaded data from DeepFunding Portal database', {
      commentCount: comments.length,
      commentVoteCount: commentVotes.length,
      proposalCount: proposals.length,
      userCount: users.length,
    });

    // Build lookup maps
    const relationMap = buildRelationMap(proposals);
    const projectOwnerMap = buildProjectOwnerMap(proposals);
    const commentAuthorMap = buildCommentAuthorMap(comments);
    const voteMap = aggregateVotesByComment(commentVotes);
    const userIdSet = new Set(users.map((u) => u.id));

    const now = new Date();
    const userScores = new Map<number, number>();
    const benchmarkRecords: CommentBenchmarkRecord[] = [];
    let totalCommentsScored = 0;

    // Process each comment through the pipeline
    // Only score comments whose author exists in the users table
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      if (!userIdSet.has(comment.userId)) continue;

      if (i % HEARTBEAT_INTERVAL === 0) {
        ctx.heartbeat({ phase: 'scoring', processed: i, total: comments.length });
      }

      const votes = getVoteStats(comment.commentId, voteMap);

      const timeWeight = computeTimeWeightFromString(comment.createdAt, now, {
        engagementWindowMonths: params.engagementWindowMonths,
        monthlyDecayRatePercent: params.monthlyDecayRatePercent,
      });

      const selfInteraction = detectSelfInteraction(comment, params.selfInteractionPenaltyFactor, {
        relationMap,
        commentAuthorMap,
      });

      const ownerBonus = computeOwnerBonus(
        comment.proposalId,
        votes,
        projectOwnerMap,
        params.projectOwnerUpvoteBonusMultiplier,
      );

      const baseScore = calculateBaseScore(votes, params);
      const result = computeCommentScore({
        votes,
        params,
        timeWeight,
        selfInteraction,
        ownerBonus,
      });

      benchmarkRecords.push(
        buildCommentBenchmarkRecord(comment, votes, timeWeight, selfInteraction, ownerBonus, result, baseScore),
      );

      if (result.scored) {
        totalCommentsScored++;
        const currentScore = userScores.get(comment.userId) ?? 0;
        userScores.set(comment.userId, currentScore + result.score);
      }
    }

    // Build results for users with scores
    const results: ContributionScoreResult[] = [];

    for (const [userId, score] of userScores) {
      results.push({
        user_id: userId,
        contribution_score: roundScore(score),
      });
    }

    results.sort((a, b) => a.user_id - b.user_id);

    logger.info('Computed contribution scores', {
      userCount: results.length,
    });

    ctx.heartbeat({ phase: 'upload' });

    // Generate and upload CSV output (async to avoid blocking the event loop)
    const csvContent = await stringifyCsvAsync(results, {
      header: true,
      columns: ['user_id', 'contribution_score'],
    });

    const outputKey = generateKey('snapshot', snapshotId, `${snapshot.algorithmPresetFrozen.key}.csv`);

    await storage.putObject({
      bucket: config.storage.bucket,
      key: outputKey,
      body: csvContent,
      contentType: 'text/csv',
    });

    logger.info('Uploaded contribution score results', { outputKey });

    const userIdsInResult = new Set(results.map((r) => r.user_id));
    const userScoresForBenchmark = new Map(results.map((r) => [r.user_id, r.contribution_score]));
    const allUserIds = users.map((u) => u.id);
    const benchmark = formatBenchmarkOutput({
      records: benchmarkRecords,
      snapshotId,
      userIdsInResult,
      allUserIds,
      userScores: userScoresForBenchmark,
      params,
      totalCommentsProcessed: comments.length,
      totalCommentsScored,
    });
    const benchmarkKey = generateKey('snapshot', snapshotId, 'contribution_score_details.json');

    await storage.putObject({
      bucket: config.storage.bucket,
      key: benchmarkKey,
      body: JSON.stringify(benchmark, null, 2),
      contentType: 'application/json',
    });

    logger.info('Uploaded contribution score benchmark', { benchmarkKey });

    return {
      outputs: {
        contribution_score: outputKey,
        contribution_score_details: benchmarkKey,
      },
    };
  } finally {
    closeDbInstance(db);
    await rm(dirname(dbPath), { recursive: true, force: true });
  }
}
