import { describe, expect, it } from 'vitest';
import { fetchComments } from '../../../../src/resources/comments/api.js';
import type { CommentApiResponse } from '../../../../src/resources/comments/types.js';
import { createMockClient } from '../../../utils/api-helpers.js';
import { createMockComment } from '../../../utils/mock-helpers.js';

describe('Comment API', () => {
  describe('fetchComments', () => {
    it('should fetch comments with pagination', async () => {
      const comment1 = createMockComment({ comment_id: 1 });
      const comment2 = createMockComment({ comment_id: 2 });

      const mockResponse: CommentApiResponse = {
        comments: [comment1, comment2],
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
      for await (const page of fetchComments(client)) {
        results.push(...page.data);
      }

      expect(results.length).toBe(2);
      expect(client.mockGet).toHaveBeenCalledWith('/comments', { page: 1, limit: 500 });
    });

    it('should include userId filter when provided', async () => {
      const mockResponse: CommentApiResponse = {
        comments: [],
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
      for await (const page of fetchComments(client, { userId: 10 })) {
        results.push(...page.data);
      }

      expect(client.mockGet).toHaveBeenCalledWith('/comments', { page: 1, limit: 500, user_id: 10 });
    });

    it('should include proposalId filter when provided', async () => {
      const mockResponse: CommentApiResponse = {
        comments: [],
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
      for await (const page of fetchComments(client, { proposalId: 20 })) {
        results.push(...page.data);
      }

      expect(client.mockGet).toHaveBeenCalledWith('/comments', { page: 1, limit: 500, proposal_id: 20 });
    });
  });
});
