import type { AlgorithmPresetFrozen } from '@reputo/database';

export interface ProposalRecord {
  id: number;
  roundId: number;
  poolId: number;
  proposerId: number;
  isAwarded: boolean | number;
  isCompleted: boolean | number;
  createdAt: string;
  teamMembers: string;
  rawJson: string;
}

export interface ReviewRecord {
  reviewId: number;
  proposalId: number | null;
  reviewerId: number | null;
  reviewType: string;
  overallRating: string;
  createdAt: string | null;
  rawJson: string;
}

export interface UserRecord {
  id: number;
  collectionId: string;
  userName: string;
  email: string;
  totalProposals: number;
  rawJson: string;
}

export interface ProposalEngagementParams {
  fundedConcludedRewardWeight: number;
  unfundedPenaltyWeight: number;
  engagementWindowMonths: number;
  monthlyDecayRatePercent: number;
  decayBucketSizeMonths: number;
}

export interface ProposalEngagementResult {
  user_id: number;
  proposal_engagement: number;
}

export type ProposalClassification = 'funded_concluded' | 'unfunded' | 'other';

export type ProposalSkipReason =
  | 'invalid_created_at'
  | 'outside_engagement_window'
  | 'no_community_reviews'
  | 'not_reward_or_penalty_class'
  | null;

export type CreditedRole = 'proposer' | 'team_member';

export interface ProposalEngagementProposalDetail {
  proposal_id: number;
  round_id: number;
  pool_id: number;
  proposer_id: number;
  team_member_ids: number[];
  credited_user_ids: number[];
  credited_collection_ids: string[];
  created_at: string;
  is_awarded: boolean;
  is_completed: boolean;
  classification: ProposalClassification;
  community_review_count: number;
  community_proposal_score_avg: number | null;
  community_proposal_score_norm: number | null;
  tw: number | null;
  age_months: number | null;
  bucket_index: number | null;
  proposal_reward: number;
  proposal_penalty: number;
  scored: boolean;
  skip_reason: ProposalSkipReason;
}

export interface ProposalEngagementAttributionDetail extends ProposalEngagementProposalDetail {
  user_id: number;
  collection_id: string;
  role: CreditedRole;
}

export interface ProposalEngagementUserDetail {
  user_id: number;
  collection_id: string;
  proposal_engagement: number;
  proposal_count: number;
  proposals_scored_count: number;
  proposal_positive_sum: number;
  proposal_negative_sum: number;
  proposals: ProposalEngagementAttributionDetail[];
}

export interface ProposalEngagementDetailsFile {
  snapshot_id: string;
  algorithm_key: string;
  algorithm_version: string;
  generated_at: string;
  deepfunding_db_key: string;
  params: {
    funded_concluded_reward_weight: number;
    unfunded_penalty_weight: number;
    engagement_window_months: number;
    monthly_decay_rate_percent: number;
    decay_bucket_size_months: number;
  };
  users: ProposalEngagementUserDetail[];
  proposals: ProposalEngagementProposalDetail[];
  stats: {
    total_proposals_seen: number;
    total_proposals_scored: number;
    total_user_attributions: number;
    proposals_with_no_community_reviews: number;
    invalid_created_at: number;
    outside_engagement_window: number;
    not_reward_or_penalty_class: number;
  };
}

export interface ProposalEngagementComputeOutput {
  csv: ProposalEngagementResult[];
  details: Omit<
    ProposalEngagementDetailsFile,
    'snapshot_id' | 'algorithm_key' | 'algorithm_version' | 'generated_at' | 'deepfunding_db_key'
  >;
}

export function parseProposalEngagementParams(inputs: AlgorithmPresetFrozen['inputs']): ProposalEngagementParams {
  const getNumericInput = (keys: string | string[], defaultValue = 0): number => {
    const keyList = Array.isArray(keys) ? keys : [keys];
    const entry = inputs.find((i) => keyList.includes(i.key));
    if (!entry || entry.value === undefined || entry.value === null) {
      return defaultValue;
    }
    const n = Number(entry.value);
    if (!Number.isFinite(n)) {
      throw new Error(`Input "${keyList[0]}" has invalid numeric value: ${entry.value}`);
    }
    return n;
  };

  return {
    fundedConcludedRewardWeight: getNumericInput([
      'funded_concluded_reward_weight',
      'funded_concluded_proposal_weight',
    ]),
    unfundedPenaltyWeight: getNumericInput(['unfunded_penalty_weight', 'unfunded_proposal_weight']),
    engagementWindowMonths: getNumericInput('engagement_window_months'),
    monthlyDecayRatePercent: getNumericInput('monthly_decay_rate_percent'),
    decayBucketSizeMonths: getNumericInput('decay_bucket_size_months', 1),
  };
}
