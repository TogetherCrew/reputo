/**
 * Contribution Score Algorithm Types
 */

/**
 * Algorithm input parameters for contribution scoring.
 */
export interface ContributionScoreParams {
  commentBaseScore: number;
  commentUpvoteWeight: number;
  commentDownvoteWeight: number;
  selfInteractionPenaltyFactor: number;
  projectOwnerUpvoteBonusMultiplier: number;
  engagementWindowMonths: number;
  monthlyDecayRatePercent: number;
  decayBucketSizeMonths: number;
}

/**
 * CSV output row for contribution score.
 */
export interface ContributionScoreResult {
  user_id: number;
  contribution_score: number;
}
