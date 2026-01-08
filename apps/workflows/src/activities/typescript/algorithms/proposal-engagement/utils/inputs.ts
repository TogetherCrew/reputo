import type { AlgorithmPresetFrozen } from '@reputo/database';

import type { ProposalEngagementParams } from '../types.js';

/**
 * Extract algorithm parameters from snapshot inputs.
 *
 * @param inputs - Raw inputs from the algorithm preset
 * @returns Typed algorithm parameters
 */
export function extractInputs(inputs: AlgorithmPresetFrozen['inputs']): ProposalEngagementParams {
  const values = Object.fromEntries((inputs ?? []).map(({ key, value }) => [key, value])) as Record<string, unknown>;

  return {
    fundedConcludedRewardWeight: values.funded_concluded_reward_weight as number,
    unfundedPenaltyWeight: values.unfunded_penalty_weight as number,
    engagementWindowMonths: values.engagement_window_months as number,
    monthlyDecayRatePercent: values.monthly_decay_rate_percent as number,
    decayBucketSizeMonths: values.decay_bucket_size_months as number,
  };
}
