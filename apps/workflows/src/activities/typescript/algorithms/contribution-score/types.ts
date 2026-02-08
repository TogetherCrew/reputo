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

/**
 * Per-comment benchmark trace (JSON-serializable).
 */
export interface CommentBenchmarkRecord {
  comment_id: number;
  user_id: number;
  proposal_id: number;
  created_at: string;
  votes: {
    upvotes: number;
    downvotes: number;
    upvoter_ids: number[];
  };
  time_weight: {
    tw: number;
    age_months: number;
    bucket_index: number;
    is_valid: boolean;
    is_within_window: boolean;
  };
  self_interaction: {
    is_related_project: boolean;
    is_same_author_reply: boolean;
    discount_conditions: number;
    discount_multiplier: number;
  };
  owner_bonus: {
    owner_upvoted: boolean;
    owner_bonus: number;
  };
  base_score: number;
  comment_score: number;
  scored: boolean;
}

/**
 * Per-user benchmark entry with full comment trace.
 */
export interface UserBenchmarkRecord {
  user_id: number;
  contribution_score: number;
  comment_count: number;
  comments: CommentBenchmarkRecord[];
}

/** Score precision for output (2 decimal places). */
export const SCORE_PRECISION = 2;

/**
 * Round a score to avoid floating-point artifacts.
 */
export function roundScore(score: number): number {
  return Math.round(score * 10 ** SCORE_PRECISION) / 10 ** SCORE_PRECISION;
}

/**
 * Benchmark metadata with included/excluded users, config, and metrics.
 */
export interface ContributionScoreBenchmarkMetadata {
  snapshot_id: string;
  computed_at: string;
  config: ContributionScoreParams;
  users: {
    included_ids: number[];
    excluded_ids: number[];
  };
  metrics: {
    total_users_in_table: number;
    users_with_score: number;
    users_excluded_no_score: number;
    total_comments_processed: number;
    total_comments_scored: number;
  };
}

/**
 * Root benchmark output structure.
 */
export interface ContributionScoreBenchmark {
  users: UserBenchmarkRecord[];
  metadata: ContributionScoreBenchmarkMetadata;
}
