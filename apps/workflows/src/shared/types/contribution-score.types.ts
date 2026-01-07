import type { AlgorithmPresetFrozen } from '@reputo/database';

export interface CommentRecord {
  commentId: number;
  parentId: number;
  isReply: boolean | number;
  userId: number;
  proposalId: number;
  content: string;
  commentVotes: string;
  createdAt: string;
  updatedAt: string;
  rawJson: string;
}

export interface CommentVoteRecord {
  voterId: number;
  commentId: number;
  voteType: string;
  createdAt: string | null;
  rawJson: string;
}

export interface ContributionScoreProposalRecord {
  id: number;
  roundId: number;
  poolId: number;
  proposerId: number;
  title: string;
  content: string;
  link: string;
  featureImage: string;
  requestedAmount: string;
  awardedAmount: string;
  isAwarded: boolean | number;
  isCompleted: boolean | number;
  createdAt: string;
  updatedAt: string | null;
  teamMembers: string;
  rawJson: string;
}

export interface ContributionScoreUserRecord {
  id: number;
  collectionId: string;
  userName: string;
  email: string;
  totalProposals: number;
  rawJson: string;
}

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

export interface ContributionScoreResult {
  user_id: number;
  contribution_score: number;
}

export interface ContributionScoreCommentDetail {
  comment_id: number;
  parent_id: number;
  is_reply: boolean;
  proposal_id: number;
  user_id: number;
  collection_id: string;
  created_at: string;
  updated_at: string;
  upvotes: number;
  downvotes: number;
  base: number;
  related_project: boolean;
  same_author_reply: boolean;
  k: number;
  self_interaction_multiplier: number;
  tw: number | null;
  age_months: number | null;
  bucket_index: number | null;
  owner_upvoted: boolean;
  owner_bonus: number;
  comment_score: number;
  scored: boolean;
  skip_reason: 'invalid_created_at' | 'outside_engagement_window' | null;
}

export interface ContributionScoreUserDetail {
  user_id: number;
  collection_id: string;
  contribution_score: number;
  comment_count: number;
  comments_scored_count: number;
  comments: ContributionScoreCommentDetail[];
}

export interface ContributionScoreDetailsFile {
  snapshot_id: string;
  algorithm_key: string;
  algorithm_version: string;
  generated_at: string;
  deepfunding_db_key: string;
  params: {
    comment_base_score: number;
    comment_upvote_weight: number;
    comment_downvote_weight: number;
    self_interaction_penalty_factor: number;
    project_owner_upvote_bonus_multiplier: number;
    engagement_window_months: number;
    monthly_decay_rate_percent: number;
    decay_bucket_size_months: number;
  };
  users: ContributionScoreUserDetail[];
  comments: ContributionScoreCommentDetail[];
  stats: {
    total_comments_seen: number;
    total_comments_scored: number;
    invalid_created_at: number;
  };
}

export interface ContributionScoreComputeOutput {
  csv: ContributionScoreResult[];
  details: Omit<
    ContributionScoreDetailsFile,
    'snapshot_id' | 'algorithm_key' | 'algorithm_version' | 'generated_at' | 'deepfunding_db_key'
  >;
}

export interface ContributionScoreComputeLogger {
  warn: (message: string, context?: Record<string, unknown>) => void;
}

export function parseContributionScoreParams(inputs: AlgorithmPresetFrozen['inputs']): ContributionScoreParams {
  const getNumericInput = (key: string, defaultValue = 0): number => {
    const entry = inputs.find((i) => i.key === key);
    if (!entry || entry.value === undefined || entry.value === null) {
      return defaultValue;
    }
    const numValue = Number(entry.value);
    if (Number.isNaN(numValue)) {
      throw new Error(`Input "${key}" has invalid numeric value: ${entry.value}`);
    }
    return numValue;
  };

  return {
    commentBaseScore: getNumericInput('comment_base_score'),
    commentUpvoteWeight: getNumericInput('comment_upvote_weight'),
    commentDownvoteWeight: getNumericInput('comment_downvote_weight'),
    selfInteractionPenaltyFactor: getNumericInput('self_interaction_penalty_factor'),
    projectOwnerUpvoteBonusMultiplier: getNumericInput('project_owner_upvote_bonus_multiplier'),
    engagementWindowMonths: getNumericInput('engagement_window_months'),
    monthlyDecayRatePercent: getNumericInput('monthly_decay_rate_percent'),
    decayBucketSizeMonths: getNumericInput('decay_bucket_size_months', 1),
  };
}
