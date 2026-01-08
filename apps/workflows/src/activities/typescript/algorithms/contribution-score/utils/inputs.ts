import type { AlgorithmPresetFrozen } from '@reputo/database';

import type { ContributionScoreParams } from '../types.js';

/**
 * Extract algorithm parameters from snapshot inputs.
 * Data is assumed to be valid (validated at workflow level).
 *
 * @param inputs - Raw inputs from the algorithm preset
 * @returns Typed algorithm parameters
 */
export function extractInputs(inputs: AlgorithmPresetFrozen['inputs']): ContributionScoreParams {
  const values = Object.fromEntries((inputs ?? []).map(({ key, value }) => [key, value])) as Record<string, unknown>;

  return {
    commentBaseScore: (values.comment_base_score as number) ?? 0,
    commentUpvoteWeight: (values.comment_upvote_weight as number) ?? 0,
    commentDownvoteWeight: (values.comment_downvote_weight as number) ?? 0,
    selfInteractionPenaltyFactor: (values.self_interaction_penalty_factor as number) ?? 0,
    projectOwnerUpvoteBonusMultiplier: (values.project_owner_upvote_bonus_multiplier as number) ?? 0,
    engagementWindowMonths: (values.engagement_window_months as number) ?? 0,
    monthlyDecayRatePercent: (values.monthly_decay_rate_percent as number) ?? 0,
    decayBucketSizeMonths: (values.decay_bucket_size_months as number) ?? 1,
  };
}
