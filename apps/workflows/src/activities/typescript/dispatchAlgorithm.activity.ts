import type { Snapshot } from '@reputo/database';
import type { Storage } from '@reputo/storage';
import type { HydratedDocument } from 'mongoose';
import { UnsupportedAlgorithmError } from '../../shared/errors/index.js';
import type { AlgorithmComputeFunction, AlgorithmResult } from '../../shared/types/index.js';
import { computeContributionScore } from './algorithms/contribution-score/compute.js';
import { computeProposalEngagement } from './algorithms/proposal-engagement/compute.js';
import { computeVotingEngagement } from './algorithms/voting-engagement/compute.js';

const registry: Record<string, AlgorithmComputeFunction> = {
  voting_engagement: computeVotingEngagement,
  contribution_score: computeContributionScore,
  proposal_engagement: computeProposalEngagement,
};

export function dispatchAlgorithm(storage: Storage) {
  return async function runTypescriptAlgorithm(snapshot: HydratedDocument<Snapshot>): Promise<AlgorithmResult> {
    const algorithmKey = snapshot.algorithmPresetFrozen.key;
    const compute = registry[algorithmKey];
    if (!compute) {
      throw new UnsupportedAlgorithmError(algorithmKey);
    }
    return compute(snapshot, storage);
  };
}
