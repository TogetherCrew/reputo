import type { ProposalRecord } from '@reputo/deepfunding-portal-api';

import type { CommunityScoreResult } from '../pipeline/community-scores.js';
import type { ProposalStatusInfo } from '../pipeline/proposal-classification.js';
import type { ProposalScoreResult } from '../pipeline/proposal-scoring.js';
import type { TimeWeightResult } from '../pipeline/time-weight.js';
import type {
  ProposalBenchmarkRecord,
  ProposalEngagementBenchmark,
  ProposalEngagementParams,
  UserProposalBenchmarkRecord,
} from '../types.js';

export function buildProposalBenchmarkRecord(
  proposal: ProposalRecord,
  owners: { proposerId: number; teamMembersArray: number[]; ownersArray: number[] },
  status: ProposalStatusInfo,
  communityScore: CommunityScoreResult,
  timeWeight: TimeWeightResult,
  scoreResult: ProposalScoreResult,
): ProposalBenchmarkRecord {
  return {
    proposal_id: proposal.id,
    round_id: proposal.roundId,
    created_at: proposal.createdAt,
    owners: {
      proposer_id: owners.proposerId,
      team_member_ids: owners.teamMembersArray,
      all_owner_ids: owners.ownersArray,
    },
    classification: {
      is_awarded: status.isAwarded,
      is_completed: status.isCompleted,
      classification: status.classification,
    },
    community_score: {
      count: communityScore.count,
      avg: communityScore.avg,
      norm: communityScore.norm,
    },
    time_weight: {
      tw: timeWeight.tw,
      age_months: timeWeight.ageMonths,
      bucket_index: timeWeight.bucketIndex,
      is_valid: timeWeight.isValid,
      is_within_window: timeWeight.isWithinWindow,
    },
    score: {
      proposal_reward: scoreResult.proposalReward,
      proposal_penalty: scoreResult.proposalPenalty,
      scored: scoreResult.scored,
      skip_reason: scoreResult.skipReason,
    },
  };
}

export interface FormatBenchmarkInput {
  records: ProposalBenchmarkRecord[];
  snapshotId: string;
  userIdsInResult: Set<number>;
  allUserIds: number[];
  userScores: Map<number, number>;
  userAccumulators: Map<number, { positiveSum: number; negativeSum: number }>;
  params: ProposalEngagementParams;
  totalProposalsProcessed: number;
  totalProposalsScored: number;
  proposalsSkippedUnsupportedRound: number;
}

export function formatBenchmarkOutput(input: FormatBenchmarkInput): ProposalEngagementBenchmark {
  const {
    records,
    snapshotId,
    userIdsInResult,
    allUserIds,
    userScores,
    userAccumulators,
    params,
    totalProposalsProcessed,
    totalProposalsScored,
    proposalsSkippedUnsupportedRound,
  } = input;

  // Group proposal records by user (only for users in result set)
  const userProposalMap = new Map<number, ProposalBenchmarkRecord[]>();

  for (const record of records) {
    for (const ownerId of record.owners.all_owner_ids) {
      if (!userIdsInResult.has(ownerId)) continue;
      const list = userProposalMap.get(ownerId) ?? [];
      list.push(record);
      userProposalMap.set(ownerId, list);
    }
  }

  const users: UserProposalBenchmarkRecord[] = [];

  for (const [userId, proposals] of userProposalMap) {
    const engagement = userScores.get(userId) ?? 0;
    const acc = userAccumulators.get(userId);
    users.push({
      user_id: userId,
      proposal_engagement: engagement,
      positive_sum: acc?.positiveSum ?? 0,
      negative_sum: acc?.negativeSum ?? 0,
      proposal_count: proposals.length,
      proposals,
    });
  }

  users.sort((a, b) => a.user_id - b.user_id);

  const includedIds = Array.from(userIdsInResult).sort((a, b) => a - b);
  const allUserIdSet = new Set(allUserIds);
  const excludedIds = allUserIds.filter((id) => !userIdsInResult.has(id)).sort((a, b) => a - b);

  const usersWithScore = includedIds.length;
  const usersExcludedNoScore = allUserIdSet.size - usersWithScore;

  return {
    users,
    metadata: {
      snapshot_id: snapshotId,
      computed_at: new Date().toISOString(),
      config: params,
      users: {
        included_ids: includedIds,
        excluded_ids: excludedIds,
      },
      metrics: {
        total_users_in_table: allUserIdSet.size,
        users_with_score: usersWithScore,
        users_excluded_no_score: usersExcludedNoScore,
        total_proposals_processed: totalProposalsProcessed,
        total_proposals_scored: totalProposalsScored,
        proposals_skipped_unsupported_round: proposalsSkippedUnsupportedRound,
      },
    },
  };
}
