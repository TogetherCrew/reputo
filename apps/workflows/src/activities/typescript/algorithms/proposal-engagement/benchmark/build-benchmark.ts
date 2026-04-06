import type { ProposalRecord } from '@reputo/deepfunding-portal-api';

import type { CommunityScoreResult } from '../pipeline/community-scores.js';
import type { ProposalStatusInfo } from '../pipeline/proposal-classification.js';
import type { ProposalScoreResult } from '../pipeline/proposal-scoring.js';
import type { TimeWeightResult } from '../pipeline/time-weight.js';
import type {
  ProposalBenchmarkRecord,
  ProposalEngagementBenchmark,
  ProposalEngagementParams,
  SubIdProposalBenchmarkRecord,
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
  subIds: string[];
  subIdScores: Map<string, number>;
  subIdAccumulators: Map<string, { positiveSum: number; negativeSum: number }>;
  deepProposalPortalIdBySubId: Map<string, string | null>;
  matchedSubIds: Set<string>;
  deepProposalPortalSubIdsIndex: Map<string, string[]>;
  params: ProposalEngagementParams;
  totalProposalsProcessed: number;
  totalProposalsScored: number;
  proposalsSkippedUnsupportedRound: number;
}

export function formatBenchmarkOutput(input: FormatBenchmarkInput): ProposalEngagementBenchmark {
  const {
    records,
    snapshotId,
    subIds,
    subIdScores,
    subIdAccumulators,
    deepProposalPortalIdBySubId,
    matchedSubIds,
    deepProposalPortalSubIdsIndex,
    params,
    totalProposalsProcessed,
    totalProposalsScored,
    proposalsSkippedUnsupportedRound,
  } = input;

  const subIdProposalMap = new Map<string, ProposalBenchmarkRecord[]>();

  for (const record of records) {
    for (const ownerId of record.owners.all_owner_ids) {
      const targetSubIds = deepProposalPortalSubIdsIndex.get(String(ownerId)) ?? [];

      for (const subId of targetSubIds) {
        const list = subIdProposalMap.get(subId) ?? [];
        list.push(record);
        subIdProposalMap.set(subId, list);
      }
    }
  }

  const subIdRows: SubIdProposalBenchmarkRecord[] = [];

  for (const subId of subIds) {
    const proposals = subIdProposalMap.get(subId) ?? [];
    const engagement = subIdScores.get(subId) ?? 0;
    const acc = subIdAccumulators.get(subId);
    subIdRows.push({
      sub_id: subId,
      deep_proposal_portal_id: deepProposalPortalIdBySubId.get(subId) ?? null,
      proposal_engagement: engagement,
      positive_sum: acc?.positiveSum ?? 0,
      negative_sum: acc?.negativeSum ?? 0,
      proposal_count: proposals.length,
      proposals,
    });
  }

  subIdRows.sort((a, b) => a.sub_id.localeCompare(b.sub_id));
  const matchedIds = [...matchedSubIds].sort((a, b) => a.localeCompare(b));
  const unmatchedIds = subIds.filter((subId) => !matchedSubIds.has(subId));

  return {
    sub_ids: subIdRows,
    metadata: {
      snapshot_id: snapshotId,
      computed_at: new Date().toISOString(),
      config: {
        fundedConcludedRewardWeight: params.fundedConcludedRewardWeight,
        unfundedPenaltyWeight: params.unfundedPenaltyWeight,
        engagementWindowMonths: params.engagementWindowMonths,
        monthlyDecayRatePercent: params.monthlyDecayRatePercent,
      },
      sub_ids: {
        provided_ids: subIds,
        matched_ids: matchedIds,
        unmatched_ids: unmatchedIds,
      },
      metrics: {
        total_sub_ids_provided: subIds.length,
        sub_ids_with_matching_owner: matchedIds.length,
        total_proposals_processed: totalProposalsProcessed,
        total_proposals_scored: totalProposalsScored,
        proposals_skipped_unsupported_round: proposalsSkippedUnsupportedRound,
      },
    },
  };
}
