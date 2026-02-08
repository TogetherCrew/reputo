import type { AlgorithmPresetFrozen } from '@reputo/database';

import { MissingInputError } from '../../../../../shared/errors/index.js';
import type { ProposalEngagementParams } from '../types.js';

const REQUIRED_KEYS: (keyof ProposalEngagementParams)[] = [
  'fundedConcludedRewardWeight',
  'unfundedPenaltyWeight',
  'engagementWindowMonths',
  'monthlyDecayRatePercent',
  'decayBucketSizeMonths',
];

const KEY_MAP: Record<string, keyof ProposalEngagementParams> = {
  funded_concluded_reward_weight: 'fundedConcludedRewardWeight',
  unfunded_penalty_weight: 'unfundedPenaltyWeight',
  engagement_window_months: 'engagementWindowMonths',
  monthly_decay_rate_percent: 'monthlyDecayRatePercent',
  decay_bucket_size_months: 'decayBucketSizeMonths',
};

export function extractInputs(inputs: AlgorithmPresetFrozen['inputs']): ProposalEngagementParams {
  const raw = Object.fromEntries((inputs ?? []).map(({ key, value }) => [key, value])) as Record<string, unknown>;

  const params = {} as Record<keyof ProposalEngagementParams, number>;

  for (const [snakeKey, camelKey] of Object.entries(KEY_MAP)) {
    const value = raw[snakeKey];
    if (value === undefined || value === null) {
      throw new MissingInputError(snakeKey);
    }
    params[camelKey] = value as number;
  }

  for (const key of REQUIRED_KEYS) {
    if (params[key] === undefined) {
      throw new MissingInputError(key);
    }
  }

  return params;
}
