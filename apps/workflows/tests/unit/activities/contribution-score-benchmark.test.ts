import { describe, expect, it } from 'vitest';
import {
  buildCommentBenchmarkRecord,
  formatBenchmarkOutput,
} from '../../../src/activities/typescript/algorithms/contribution-score/benchmark/index.js';
import type { CommentBenchmarkRecord } from '../../../src/activities/typescript/algorithms/contribution-score/types.js';

const mockComment = {
  commentId: 100,
  parentId: 0,
  isReply: false,
  userId: 42,
  proposalId: 5,
  content: 'Test comment',
  commentVotes: '0',
  createdAt: '2026-01-15T10:00:00.000Z',
  updatedAt: '2026-01-15T10:00:00.000Z',
  rawJson: '{}',
};

const mockVotes = {
  upvotes: 3,
  downvotes: 0,
  upvoterIds: new Set([1, 2, 3]),
};

const mockTimeWeight = {
  tw: 0.9,
  ageMonths: 2.5,
  bucketIndex: 2,
  isValid: true,
  isWithinWindow: true,
};

const mockSelfInteraction = {
  isRelatedProject: false,
  isSameAuthorReply: false,
  discountConditions: 0,
  discountMultiplier: 1,
};

const mockOwnerBonus = {
  ownerUpvoted: true,
  ownerBonus: 1.2,
};

const mockParams = {
  commentBaseScore: 10,
  commentUpvoteWeight: 1,
  commentDownvoteWeight: 1,
  selfInteractionPenaltyFactor: 1,
  projectOwnerUpvoteBonusMultiplier: 1.2,
  engagementWindowMonths: 12,
  monthlyDecayRatePercent: 10,
};

describe('contribution-score benchmark', () => {
  describe('buildCommentBenchmarkRecord', () => {
    it('builds a JSON-serializable record with rounded scores', () => {
      const result = buildCommentBenchmarkRecord(
        mockComment,
        mockVotes,
        mockTimeWeight,
        mockSelfInteraction,
        mockOwnerBonus,
        { score: 12.96, scored: true },
        10.8,
      );

      expect(result.comment_score).toBe(12.96);
      expect(result.votes.upvoter_ids).toEqual([1, 2, 3]);
    });
  });

  describe('formatBenchmarkOutput', () => {
    const baseRecord: CommentBenchmarkRecord = {
      comment_id: 0,
      user_id: 0,
      proposal_id: 0,
      created_at: '',
      votes: { upvotes: 0, downvotes: 0, upvoter_ids: [] },
      time_weight: {
        tw: 0,
        age_months: 0,
        bucket_index: 0,
        is_valid: true,
        is_within_window: true,
      },
      self_interaction: {
        is_related_project: false,
        is_same_author_reply: false,
        discount_conditions: 0,
        discount_multiplier: 1,
      },
      owner_bonus: { owner_upvoted: false, owner_bonus: 1 },
      base_score: 0,
      comment_score: 0,
      scored: false,
    };

    it('includes metadata with included/excluded ids, config, and metrics', () => {
      const records: CommentBenchmarkRecord[] = [
        {
          ...baseRecord,
          comment_id: 1,
          user_id: 10,
          base_score: 12,
          comment_score: 12,
          scored: true,
        },
        {
          ...baseRecord,
          comment_id: 2,
          user_id: 35,
          base_score: 5,
          comment_score: 5,
          scored: true,
        },
      ];

      const result = formatBenchmarkOutput({
        records,
        snapshotId: 'snap-123',
        userIdsInResult: new Set([10, 35]),
        allUserIds: [10, 35, 100],
        userScores: new Map([
          [10, 12],
          [35, 5],
        ]),
        params: mockParams,
        totalCommentsProcessed: 2,
        totalCommentsScored: 2,
      });

      expect(result.users).toHaveLength(2);
      expect(result.metadata.snapshot_id).toBe('snap-123');
      expect(result.metadata.config).toEqual(mockParams);
      expect(result.metadata.users.included_ids).toEqual([10, 35]);
      expect(result.metadata.users.excluded_ids).toEqual([100]);
      expect(result.metadata.metrics.total_users_in_table).toBe(3);
      expect(result.metadata.metrics.users_with_score).toBe(2);
      expect(result.metadata.metrics.users_excluded_no_score).toBe(1);
      expect(result.metadata.metrics.total_comments_processed).toBe(2);
      expect(result.metadata.metrics.total_comments_scored).toBe(2);
      expect(result.metadata.metrics).not.toHaveProperty('comment_authors_excluded_not_in_table');
    });

    it('excludes users not in userIdsInResult', () => {
      const records: CommentBenchmarkRecord[] = [
        { ...baseRecord, comment_id: 1, user_id: 4, comment_score: 24.5, scored: true },
        { ...baseRecord, comment_id: 2, user_id: 35, comment_score: 5, scored: true },
      ];

      const result = formatBenchmarkOutput({
        records,
        snapshotId: 'snap-789',
        userIdsInResult: new Set([35]),
        allUserIds: [35],
        userScores: new Map([[35, 5]]),
        params: mockParams,
        totalCommentsProcessed: 2,
        totalCommentsScored: 2,
      });

      expect(result.users).toHaveLength(1);
      expect(result.users[0]!.user_id).toBe(35);
      expect(result.users[0]!.contribution_score).toBe(5);
    });
  });
});
