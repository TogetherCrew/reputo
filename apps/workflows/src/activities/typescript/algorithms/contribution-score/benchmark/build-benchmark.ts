import type { CommentRecord } from '@reputo/deepfunding-portal-api';
import type { CommentScoreResult } from '../pipeline/comment-scoring.js';
import type { OwnerBonusResult } from '../pipeline/owner-bonus.js';
import type { SelfInteractionResult } from '../pipeline/self-interaction.js';
import type { TimeWeightResult } from '../pipeline/time-weight.js';
import type { VoteStats } from '../pipeline/vote-aggregation.js';
import type {
  CommentBenchmarkRecord,
  ContributionScoreBenchmark,
  ContributionScoreParams,
  SubIdBenchmarkRecord,
} from '../types.js';
import { roundScore } from '../types.js';

/**
 * Build a per-comment benchmark record from pipeline outputs.
 * Converts VoteStats.upvoterIds Set to array for JSON serialization.
 * Rounds comment_score to avoid floating-point artifacts.
 */
export function buildCommentBenchmarkRecord(
  comment: CommentRecord,
  votes: VoteStats,
  timeWeight: TimeWeightResult,
  selfInteraction: SelfInteractionResult,
  ownerBonus: OwnerBonusResult,
  scoreResult: CommentScoreResult,
  baseScore: number,
): CommentBenchmarkRecord {
  const commentScore = scoreResult.scored ? roundScore(scoreResult.score) : 0;
  return {
    comment_id: comment.commentId,
    user_id: comment.userId,
    proposal_id: comment.proposalId,
    created_at: comment.createdAt,
    votes: {
      upvotes: votes.upvotes,
      downvotes: votes.downvotes,
      upvoter_ids: Array.from(votes.upvoterIds),
    },
    time_weight: {
      tw: timeWeight.tw,
      age_months: timeWeight.ageMonths,
      bucket_index: timeWeight.bucketIndex,
      is_valid: timeWeight.isValid,
      is_within_window: timeWeight.isWithinWindow,
    },
    self_interaction: {
      is_related_project: selfInteraction.isRelatedProject,
      is_same_author_reply: selfInteraction.isSameAuthorReply,
      discount_conditions: selfInteraction.discountConditions,
      discount_multiplier: selfInteraction.discountMultiplier,
    },
    owner_bonus: {
      owner_upvoted: ownerBonus.ownerUpvoted,
      owner_bonus: ownerBonus.ownerBonus,
    },
    base_score: baseScore,
    comment_score: commentScore,
    scored: scoreResult.scored,
  };
}

export interface FormatBenchmarkInput {
  records: CommentBenchmarkRecord[];
  snapshotId: string;
  subIds: string[];
  subIdScores: Map<string, number>;
  deepProposalPortalIdBySubId: Map<string, string | null>;
  matchedSubIds: Set<string>;
  deepProposalPortalSubIdsIndex: Map<string, string[]>;
  params: ContributionScoreParams;
  totalCommentsProcessed: number;
  totalCommentsScored: number;
}

/**
 * Aggregate benchmark records by user and format into the final output structure.
 * Uses users table as source: only includes users present in userIdsInResult.
 * Populates metadata with included/excluded user ids, config, and metrics.
 */
export function formatBenchmarkOutput(input: FormatBenchmarkInput): ContributionScoreBenchmark {
  const {
    records,
    snapshotId,
    subIds,
    subIdScores,
    deepProposalPortalIdBySubId,
    matchedSubIds,
    deepProposalPortalSubIdsIndex,
    params,
    totalCommentsProcessed,
    totalCommentsScored,
  } = input;

  const subIdMap = new Map<string, CommentBenchmarkRecord[]>();

  for (const record of records) {
    for (const subId of deepProposalPortalSubIdsIndex.get(String(record.user_id)) ?? []) {
      const list = subIdMap.get(subId) ?? [];
      list.push(record);
      subIdMap.set(subId, list);
    }
  }

  const subIdRows: SubIdBenchmarkRecord[] = [];

  for (const subId of subIds) {
    const comments = subIdMap.get(subId) ?? [];
    const contributionScore = subIdScores.get(subId) ?? 0;
    subIdRows.push({
      sub_id: subId,
      deep_proposal_portal_id: deepProposalPortalIdBySubId.get(subId) ?? null,
      contribution_score: contributionScore,
      comment_count: comments.length,
      comments,
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
        commentBaseScore: params.commentBaseScore,
        commentUpvoteWeight: params.commentUpvoteWeight,
        commentDownvoteWeight: params.commentDownvoteWeight,
        selfInteractionPenaltyFactor: params.selfInteractionPenaltyFactor,
        projectOwnerUpvoteBonusMultiplier: params.projectOwnerUpvoteBonusMultiplier,
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
        sub_ids_with_matching_comments: matchedIds.length,
        total_comments_processed: totalCommentsProcessed,
        total_comments_scored: totalCommentsScored,
      },
    },
  };
}
