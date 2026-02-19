import type { AlgorithmPresetFrozen } from '@reputo/database';

import { MissingInputError } from '../../../../../shared/errors/index.js';
import type { ContributionScoreParams } from '../types.js';

const REQUIRED_KEYS: (keyof ContributionScoreParams)[] = [
  'commentBaseScore',
  'commentUpvoteWeight',
  'commentDownvoteWeight',
  'selfInteractionPenaltyFactor',
  'projectOwnerUpvoteBonusMultiplier',
  'engagementWindowMonths',
  'monthlyDecayRatePercent',
];

/** Mapping from snake_case input keys to camelCase param keys. */
const KEY_MAP: Record<string, keyof ContributionScoreParams> = {
  comment_base_score: 'commentBaseScore',
  comment_upvote_weight: 'commentUpvoteWeight',
  comment_downvote_weight: 'commentDownvoteWeight',
  self_interaction_penalty_factor: 'selfInteractionPenaltyFactor',
  project_owner_upvote_bonus_multiplier: 'projectOwnerUpvoteBonusMultiplier',
  engagement_window_months: 'engagementWindowMonths',
  monthly_decay_rate_percent: 'monthlyDecayRatePercent',
};

/**
 * Extract and validate algorithm parameters from snapshot inputs.
 * All parameters are required — throws {@link MissingInputError} if any are missing.
 *
 * @param inputs - Raw inputs from the algorithm preset
 * @returns Typed algorithm parameters
 */
export function extractInputs(inputs: AlgorithmPresetFrozen['inputs']): ContributionScoreParams {
  const raw = Object.fromEntries((inputs ?? []).map(({ key, value }) => [key, value])) as Record<string, unknown>;

  const params = {} as Record<keyof ContributionScoreParams, number>;

  for (const [snakeKey, camelKey] of Object.entries(KEY_MAP)) {
    const value = raw[snakeKey];
    if (value === undefined || value === null) {
      throw new MissingInputError(snakeKey);
    }
    params[camelKey] = value as number;
  }

  // Sanity check: ensure all required keys are present (guards against KEY_MAP drift)
  for (const key of REQUIRED_KEYS) {
    if (params[key] === undefined) {
      throw new MissingInputError(key);
    }
  }

  return params;
}
