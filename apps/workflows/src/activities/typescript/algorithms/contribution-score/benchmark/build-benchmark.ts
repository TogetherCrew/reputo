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
  UserBenchmarkRecord,
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
  userIdsInResult: Set<number>;
  allUserIds: number[];
  /** Final contribution scores (rounded) - source of truth from compute, ensures benchmark matches CSV */
  userScores: Map<number, number>;
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
    userIdsInResult,
    allUserIds,
    userScores,
    params,
    totalCommentsProcessed,
    totalCommentsScored,
  } = input;

  const userMap = new Map<number, CommentBenchmarkRecord[]>();

  for (const record of records) {
    const userId = record.user_id;
    if (!userIdsInResult.has(userId)) continue;
    const list = userMap.get(userId) ?? [];
    list.push(record);
    userMap.set(userId, list);
  }

  const users: UserBenchmarkRecord[] = [];

  for (const [userId, comments] of userMap) {
    const contributionScore = userScores.get(userId) ?? 0;
    users.push({
      user_id: userId,
      contribution_score: contributionScore,
      comment_count: comments.length,
      comments,
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
        total_comments_processed: totalCommentsProcessed,
        total_comments_scored: totalCommentsScored,
      },
    },
  };
}
