import { rm } from 'node:fs/promises';
import { dirname } from 'node:path';

import { closeDbInstance, createDb, createRepos } from '@reputo/deepfunding-portal-api';
import { generateKey, type Storage } from '@reputo/storage';
import { Context } from '@temporalio/activity';

import config from '../../../../config/index.js';
import { HEARTBEAT_INTERVAL } from '../../../../shared/constants/index.js';
import type { AlgorithmResult, Snapshot } from '../../../../shared/types/index.js';
import { stringifyCsvAsync } from '../../../../shared/utils/index.js';
import { buildProposalBenchmarkRecord, formatBenchmarkOutput } from './benchmark/index.js';
import {
  aggregateCommunityRatings,
  classifyProposal,
  computeCommunityScore,
  computeProposalScore,
  computeTimeWeightFromString,
} from './pipeline/index.js';
import type { ProposalBenchmarkRecord, ProposalEngagementResult } from './types.js';
import { roundScore } from './types.js';
import { buildProposalOwners, createDeepFundingDb, extractInputs } from './utils/index.js';

interface UserScoreAccumulator {
  positiveSum: number;
  negativeSum: number;
}

export async function computeProposalEngagement(snapshot: Snapshot, storage: Storage): Promise<AlgorithmResult> {
  const ctx = Context.current();
  const logger = ctx.log;
  const snapshotId = snapshot._id;
  const now = new Date();

  const inputs = extractInputs(snapshot.algorithmPresetFrozen.inputs);
  const dbPath = await createDeepFundingDb(snapshotId, storage);
  const db = createDb({ path: dbPath });
  const repos = createRepos(db);

  logger.info('Starting proposal_engagement algorithm', { snapshotId });
  logger.info('Algorithm inputs', inputs);

  try {
    const proposals = repos.proposals.findAll();
    const reviews = repos.reviews.findAll();
    const users = repos.users.findAll();

    logger.info('Loaded data from DeepFunding Portal database', {
      proposalCount: proposals.length,
      reviewCount: reviews.length,
      userCount: users.length,
    });

    const communityRatings = aggregateCommunityRatings(reviews);
    const userIdSet = new Set(users.map((u) => u.id));
    const userAccumulators = new Map<number, UserScoreAccumulator>();
    const benchmarkRecords: ProposalBenchmarkRecord[] = [];
    let totalProposalsScored = 0;
    let proposalsSkippedUnsupportedRound = 0;

    for (let i = 0; i < proposals.length; i++) {
      const proposal = proposals[i];

      if (i % HEARTBEAT_INTERVAL === 0) {
        ctx.heartbeat({ phase: 'scoring', processed: i, total: proposals.length });
      }

      const owners = buildProposalOwners(proposal);
      const communityScore = computeCommunityScore(proposal.id, communityRatings);
      const status = classifyProposal(proposal);
      const timeWeight = computeTimeWeightFromString(proposal.createdAt, now, {
        engagementWindowMonths: inputs.engagementWindowMonths,
        monthlyDecayRatePercent: inputs.monthlyDecayRatePercent,
        decayBucketSizeMonths: inputs.decayBucketSizeMonths,
      });

      const score = computeProposalScore({
        roundId: proposal.roundId,
        classification: status.classification,
        communityScore,
        timeWeight,
      });

      if (score.skipReason === 'unsupported_round') {
        proposalsSkippedUnsupportedRound++;
      }

      benchmarkRecords.push(
        buildProposalBenchmarkRecord(
          proposal,
          {
            proposerId: proposal.proposerId,
            teamMembersArray: owners.teamMembersArray,
            ownersArray: owners.ownersArray,
          },
          status,
          communityScore,
          timeWeight,
          score,
        ),
      );

      if (!score.scored) continue;
      totalProposalsScored++;

      // Only accumulate scores for owners present in the users table
      for (const userId of owners.ownersArray) {
        if (!userIdSet.has(userId)) continue;
        const existing = userAccumulators.get(userId);
        userAccumulators.set(userId, {
          positiveSum: (existing?.positiveSum ?? 0) + score.proposalReward,
          negativeSum: (existing?.negativeSum ?? 0) + score.proposalPenalty,
        });
      }
    }

    // Build results from accumulators (all users in accumulators are in the users table)
    const results: ProposalEngagementResult[] = [];

    for (const [userId, accumulator] of userAccumulators) {
      const engagement =
        inputs.fundedConcludedRewardWeight * accumulator.positiveSum -
        inputs.unfundedPenaltyWeight * accumulator.negativeSum;

      results.push({
        user_id: userId,
        proposal_engagement: roundScore(engagement),
      });
    }

    results.sort((a, b) => a.user_id - b.user_id);

    logger.info('Computed proposal engagement scores', {
      userCount: results.length,
    });

    ctx.heartbeat({ phase: 'upload' });

    // Generate and upload CSV output (async to avoid blocking the event loop)
    const csvContent = await stringifyCsvAsync(results, {
      header: true,
      columns: ['user_id', 'proposal_engagement'],
    });

    const outputKey = generateKey('snapshot', snapshotId, `${snapshot.algorithmPresetFrozen.key}.csv`);

    await storage.putObject({
      bucket: config.storage.bucket,
      key: outputKey,
      body: csvContent,
      contentType: 'text/csv',
    });

    logger.info('Uploaded proposal engagement results', { outputKey });

    // Generate and upload benchmark details
    const userIdsInResult = new Set(results.map((r) => r.user_id));
    const userScoresForBenchmark = new Map(results.map((r) => [r.user_id, r.proposal_engagement]));
    const allUserIds = users.map((u) => u.id);

    const benchmark = formatBenchmarkOutput({
      records: benchmarkRecords,
      snapshotId,
      userIdsInResult,
      allUserIds,
      userScores: userScoresForBenchmark,
      userAccumulators,
      params: inputs,
      totalProposalsProcessed: proposals.length,
      totalProposalsScored,
      proposalsSkippedUnsupportedRound,
    });

    const benchmarkKey = generateKey('snapshot', snapshotId, 'proposal_engagement_details.json');

    await storage.putObject({
      bucket: config.storage.bucket,
      key: benchmarkKey,
      body: JSON.stringify(benchmark, null, 2),
      contentType: 'application/json',
    });

    logger.info('Uploaded proposal engagement benchmark', { benchmarkKey });

    return {
      outputs: {
        proposal_engagement: outputKey,
        proposal_engagement_details: benchmarkKey,
      },
    };
  } finally {
    closeDbInstance(db);
    await rm(dirname(dbPath), { recursive: true, force: true });
  }
}
