import { describe, expect, it } from 'vitest';
import { normalizeCommentToRecord } from '../../../../src/resources/comments/normalize.js';
import { createMockComment } from '../../../utils/mock-helpers.js';

describe('Comment Normalization', () => {
  describe('normalizeCommentToRecord', () => {
    it('should transform API response to DB record format', () => {
      const comment = createMockComment({
        comment_id: 1,
        parent_id: 0,
        is_reply: false,
        user_id: 10,
        proposal_id: 20,
        content: 'Test comment',
        comment_votes: 5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      });

      const result = normalizeCommentToRecord(comment);

      expect(result.commentId).toBe(1);
      expect(result.parentId).toBe(0);
      expect(result.isReply).toBe(false);
      expect(result.userId).toBe(10);
      expect(result.proposalId).toBe(20);
      expect(result.content).toBe('Test comment');
      expect(result.commentVotes).toBe('5');
      expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
      expect(result.updatedAt).toBe('2024-01-02T00:00:00Z');
      expect(result.rawJson).toBe(JSON.stringify(comment));
    });

    it('should convert comment_votes to string', () => {
      const comment = createMockComment({
        comment_votes: 42,
      });

      const result = normalizeCommentToRecord(comment);
      expect(result.commentVotes).toBe('42');
    });

    it('should serialize raw JSON correctly', () => {
      const comment = createMockComment({
        comment_id: 42,
        content: 'Complex comment',
      });

      const result = normalizeCommentToRecord(comment);
      const parsed = JSON.parse(result.rawJson);

      expect(parsed.comment_id).toBe(42);
      expect(parsed.content).toBe('Complex comment');
    });
  });
});
