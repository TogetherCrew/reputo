import { rm } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { Snapshot } from '@reputo/database';
import {
  closeDb,
  commentsRepo,
  commentVotesRepo,
  initializeDb,
  proposalsRepo,
  usersRepo,
} from '@reputo/deepfunding-portal-api';
import { generateKey, type Storage } from '@reputo/storage';
import { Context } from '@temporalio/activity';
import { stringify } from 'csv-stringify/sync';
import type { HydratedDocument } from 'mongoose';

import config from '../../../../config/index.js';
import type { AlgorithmResult } from '../../../../shared/types/index.js';
import {
  aggregateVotesByComment,
  computeCommentScore,
  computeOwnerBonus,
  computeTimeWeightFromString,
  detectSelfInteraction,
  getVoteStats,
} from './pipeline/index.js';
import type { ContributionScoreResult } from './types.js';
import {
  buildCommentAuthorMap,
  buildProjectOwnerMap,
  buildRelationMap,
  createDeepFundingDb,
  extractInputs,
} from './utils/index.js';

/**
 * Computes contribution scores for users.
 *
 * @param snapshot - Snapshot document with algorithm configuration
 * @param storage - Storage client for file operations
 * @returns Algorithm result with output file locations
 */
export async function computeContributionScore(
  snapshot: HydratedDocument<Snapshot>,
  storage: Storage,
): Promise<AlgorithmResult> {
  const logger = Context.current().log;

  const params = extractInputs(snapshot.algorithmPresetFrozen.inputs);
  const dbPath = await createDeepFundingDb(snapshot.id, storage);
  initializeDb({ path: dbPath });

  logger.info('Starting contribution_score algorithm', {
    snapshotId: snapshot.id,
  });

  logger.info('Algorithm parameters', params);

  try {
    const comments = commentsRepo.findAll();
    const commentVotes = commentVotesRepo.findAll();
    const proposals = proposalsRepo.findAll();
    const users = usersRepo.findAll();

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

    const now = new Date();
    const userScores = new Map<number, number>();

    // Process each comment through the pipeline
    for (const comment of comments) {
      const votes = getVoteStats(comment.commentId, voteMap);

      const timeWeight = computeTimeWeightFromString(comment.createdAt, now, {
        engagementWindowMonths: params.engagementWindowMonths,
        monthlyDecayRatePercent: params.monthlyDecayRatePercent,
        decayBucketSizeMonths: params.decayBucketSizeMonths,
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

      const result = computeCommentScore({
        votes,
        params,
        timeWeight,
        selfInteraction,
        ownerBonus,
      });

      if (result.scored) {
        const currentScore = userScores.get(comment.userId) ?? 0;
        userScores.set(comment.userId, currentScore + result.score);
      }
    }

    // Build results for users with scores
    const results: ContributionScoreResult[] = [];

    for (const user of users) {
      const score = userScores.get(user.id);
      if (score === undefined) continue;

      results.push({
        user_id: user.id,
        contribution_score: score,
      });
    }

    results.sort((a, b) => a.user_id - b.user_id);

    logger.info('Computed contribution scores', {
      userCount: results.length,
    });

    // Generate and upload CSV output
    const csvContent = stringify(results, {
      header: true,
      columns: ['user_id', 'contribution_score'],
    });

    const outputKey = generateKey('snapshot', snapshot.id, `${snapshot.algorithmPresetFrozen.key}.csv`);

    await storage.putObject({
      bucket: config.storage.bucket,
      key: outputKey,
      body: csvContent,
      contentType: 'text/csv',
    });

    logger.info('Uploaded contribution score results', { outputKey });

    return {
      outputs: {
        contribution_score: outputKey,
      },
    };
  } finally {
    closeDb();
    await rm(dirname(dbPath), { recursive: true, force: true });
  }
}
