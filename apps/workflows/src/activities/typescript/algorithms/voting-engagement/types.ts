/**
 * Voting Engagement Algorithm Types
 */

/**
 * CSV output row for voting engagement score.
 */
export interface VotingEngagementResult {
  sub_id: string;
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

/** Score precision for output (6 decimal places — entropy needs more precision than 2dp). */
export const SCORE_PRECISION = 6;

/**
 * Round a score to avoid floating-point artifacts.
 */
export function roundScore(score: number): number {
  return Math.round(score * 10 ** SCORE_PRECISION) / 10 ** SCORE_PRECISION;
}

// ── Benchmark types ──

/**
 * Per-sub-id benchmark record capturing the full scoring breakdown.
 */
export interface SubIdBenchmarkRecord {
  sub_id: string;
  deep_voting_portal_id: string | null;
  total_votes: number;
  vote_distribution: Record<ValidVote, number>;
  entropy: number;
  voting_engagement: number;
}

/**
 * Benchmark metadata with processing stats.
 */
export interface VotingEngagementBenchmarkMetadata {
  snapshot_id: string;
  computed_at: string;
  sub_ids: {
    provided_ids: string[];
    matched_ids: string[];
    unmatched_ids: string[];
  };
  metrics: {
    total_votes_in_file: number;
    valid_votes: number;
    invalid_votes: number;
    targeted_voter_ids: number;
    sub_ids_with_votes: number;
  };
}

/**
 * Root benchmark output structure.
 */
export interface VotingEngagementBenchmark {
  sub_ids: SubIdBenchmarkRecord[];
  metadata: VotingEngagementBenchmarkMetadata;
}
