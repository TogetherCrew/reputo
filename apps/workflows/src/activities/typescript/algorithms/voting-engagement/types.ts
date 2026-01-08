/**
 * Voting Engagement Algorithm Types
 */

/**
 * CSV output row for voting engagement score.
 */
export interface VotingEngagementResult {
  collection_id: string;
  voting_engagement: number;
}

/**
 * Valid vote values (skip or 1-10).
 */
export const VALID_VOTES = ['skip', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;

export type ValidVote = (typeof VALID_VOTES)[number];

/**
 * Maximum possible Shannon entropy for 11 vote categories.
 */
export const MAX_VOTING_ENTROPY = Math.log2(11);
