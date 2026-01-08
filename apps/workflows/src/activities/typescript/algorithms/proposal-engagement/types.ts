/**
 * Proposal Engagement Algorithm Types
 */

/**
 * Algorithm input parameters for proposal engagement scoring.
 */
export interface ProposalEngagementParams {
  fundedConcludedRewardWeight: number;
  unfundedPenaltyWeight: number;
  engagementWindowMonths: number;
  monthlyDecayRatePercent: number;
  decayBucketSizeMonths: number;
}

/**
 * CSV output row for proposal engagement score.
 */
export interface ProposalEngagementResult {
  user_id: number;
  proposal_engagement: number;
}

/**
 * Proposal classification based on funding and completion status.
 */
export type ProposalClassification = 'funded_concluded' | 'unfunded' | 'other';
