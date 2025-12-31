import { describe, expect, it } from 'vitest';
import { fetchCommentVotes } from '../../../../src/resources/commentVotes/api.js';
import type { CommentVoteApiResponse } from '../../../../src/resources/commentVotes/types.js';
import { createMockClient } from '../../../utils/api-helpers.js';
import { createMockCommentVote } from '../../../utils/mock-helpers.js';

describe('CommentVote API', () => {
  describe('fetchCommentVotes', () => {
    it('should fetch comment votes with pagination', async () => {
      const vote1 = createMockCommentVote({ voter_id: 1, comment_id: 10 });
      const vote2 = createMockCommentVote({ voter_id: 2, comment_id: 10 });

      const mockResponse: CommentVoteApiResponse = {
        votes: [vote1, vote2],
        pagination: {
          current_page: 1,
          next_page: null,
          prev_page: null,
          total_pages: 1,
          total_count: 2,
        },
      };

      const client = createMockClient();
      client.mockGet.mockResolvedValue(mockResponse);

      const results: unknown[] = [];
      for await (const page of fetchCommentVotes(client)) {
        results.push(...page.data);
      }

      expect(results.length).toBe(2);
      expect(client.mockGet).toHaveBeenCalledWith('/comment_votes', { page: 1, limit: 500 });
    });

    it('should include voterId filter when provided', async () => {
      const mockResponse: CommentVoteApiResponse = {
        votes: [],
        pagination: {
          current_page: 1,
          next_page: null,
          prev_page: null,
          total_pages: 1,
          total_count: 0,
        },
      };

      const client = createMockClient();
      client.mockGet.mockResolvedValue(mockResponse);

      const results: unknown[] = [];
      for await (const page of fetchCommentVotes(client, { voterId: 10 })) {
        results.push(...page.data);
      }

      expect(client.mockGet).toHaveBeenCalledWith('/comment_votes', { page: 1, limit: 500, voter_id: 10 });
    });

    it('should include commentId filter when provided', async () => {
      const mockResponse: CommentVoteApiResponse = {
        votes: [],
        pagination: {
          current_page: 1,
          next_page: null,
          prev_page: null,
          total_pages: 1,
          total_count: 0,
        },
      };

      const client = createMockClient();
      client.mockGet.mockResolvedValue(mockResponse);

      const results: unknown[] = [];
      for await (const page of fetchCommentVotes(client, { commentId: 20 })) {
        results.push(...page.data);
      }

      expect(client.mockGet).toHaveBeenCalledWith('/comment_votes', { page: 1, limit: 500, comment_id: 20 });
    });
  });
});
