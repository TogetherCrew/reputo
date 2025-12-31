import { describe, expect, it } from 'vitest';
import { normalizeCommentVoteToRecord } from '../../../../src/resources/commentVotes/normalize.js';
import { createMockCommentVote } from '../../../utils/mock-helpers.js';

describe('CommentVote Normalization', () => {
  describe('normalizeCommentVoteToRecord', () => {
    it('should transform API response to DB record format', () => {
      const vote = createMockCommentVote({
        voter_id: 1,
        comment_id: 10,
        vote_type: 'upvote',
        created_at: '2024-01-01T00:00:00Z',
      });

      const result = normalizeCommentVoteToRecord(vote);

      expect(result.voterId).toBe(1);
      expect(result.commentId).toBe(10);
      expect(result.voteType).toBe('upvote');
      expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
      expect(result.rawJson).toBe(JSON.stringify(vote));
    });

    it('should handle null created_at', () => {
      const vote = createMockCommentVote({
        created_at: undefined,
      });

      const result = normalizeCommentVoteToRecord(vote);
      expect(result.createdAt).toBeNull();
    });

    it('should serialize raw JSON correctly', () => {
      const vote = createMockCommentVote({
        voter_id: 42,
        comment_id: 100,
        vote_type: 'downvote',
      });

      const result = normalizeCommentVoteToRecord(vote);
      const parsed = JSON.parse(result.rawJson);

      expect(parsed.voter_id).toBe(42);
      expect(parsed.comment_id).toBe(100);
      expect(parsed.vote_type).toBe('downvote');
    });
  });
});
