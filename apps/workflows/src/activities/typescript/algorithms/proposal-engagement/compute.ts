import { rm } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { Snapshot } from '@reputo/database';
import { closeDb, initializeDb, proposalsRepo, reviewsRepo, usersRepo } from '@reputo/deepfunding-portal-api';
import { generateKey, type Storage } from '@reputo/storage';
import { Context } from '@temporalio/activity';
import { stringify } from 'csv-stringify/sync';
import type { HydratedDocument } from 'mongoose';

import config from '../../../../config/index.js';
import type { AlgorithmResult } from '../../../../shared/types/index.js';
import {
  aggregateCommunityRatings,
  classifyProposal,
  computeCommunityScore,
  computeProposalScore,
  computeTimeWeightFromString,
} from './pipeline/index.js';
import type { ProposalEngagementResult } from './types.js';
import { buildProposalOwners, createDeepFundingDb, extractInputs } from './utils/index.js';

interface UserScoreAccumulator {
  positiveSum: number;
  negativeSum: number;
}

export async function computeProposalEngagement(
  snapshot: HydratedDocument<Snapshot>,
  storage: Storage,
): Promise<AlgorithmResult> {
  const logger = Context.current().log;
  const now = new Date();

  const inputs = extractInputs(snapshot.algorithmPresetFrozen.inputs);
  const dbPath = await createDeepFundingDb(snapshot.id, storage);
  initializeDb({ path: dbPath });

  logger.info('Starting proposal_engagement algorithm', {
    snapshotId: snapshot.id,
  });

  logger.info('Algorithm inputs', inputs);

  try {
    const proposals = proposalsRepo.findAll();
    const reviews = reviewsRepo.findAll();
    const users = usersRepo.findAll();

    logger.info('Loaded data from DeepFunding Portal database', {
      proposalCount: proposals.length,
      reviewCount: reviews.length,
      userCount: users.length,
    });

    const communityRatings = aggregateCommunityRatings(reviews);
    const userAccumulators = new Map<number, UserScoreAccumulator>();

    for (const proposal of proposals) {
      const owners = buildProposalOwners(proposal);
      const communityScore = computeCommunityScore(proposal.id, communityRatings);
      const status = classifyProposal(proposal);
      const timeWeight = computeTimeWeightFromString(proposal.createdAt, now, {
        engagementWindowMonths: inputs.engagementWindowMonths,
        monthlyDecayRatePercent: inputs.monthlyDecayRatePercent,
        decayBucketSizeMonths: inputs.decayBucketSizeMonths,
      });

      const score = computeProposalScore({
        classification: status.classification,
        communityScore,
        timeWeight,
      });

      if (!score.scored) continue;

      for (const userId of owners.ownersArray) {
        const existing = userAccumulators.get(userId);
        userAccumulators.set(userId, {
          positiveSum: (existing?.positiveSum ?? 0) + score.proposalReward,
          negativeSum: (existing?.negativeSum ?? 0) + score.proposalPenalty,
        });
      }
    }

    const results: ProposalEngagementResult[] = [];

    for (const user of users) {
      const accumulator = userAccumulators.get(user.id);
      if (!accumulator) continue;

      const engagement =
        inputs.fundedConcludedRewardWeight * accumulator.positiveSum -
        inputs.unfundedPenaltyWeight * accumulator.negativeSum;

      results.push({
        user_id: user.id,
        proposal_engagement: engagement,
      });
    }

    results.sort((a, b) => a.user_id - b.user_id);

    logger.info('Computed proposal engagement scores', {
      userCount: results.length,
    });

    const csvContent = stringify(results, {
      header: true,
      columns: ['user_id', 'proposal_engagement'],
    });

    const outputKey = generateKey('snapshot', snapshot.id, `${snapshot.algorithmPresetFrozen.key}.csv`);

    await storage.putObject({
      bucket: config.storage.bucket,
      key: outputKey,
      body: csvContent,
      contentType: 'text/csv',
    });

    logger.info('Uploaded proposal engagement results', { outputKey });

    return {
      outputs: {
        proposal_engagement: outputKey,
      },
    };
  } finally {
    closeDb();
    await rm(dirname(dbPath), { recursive: true, force: true });
  }
}
