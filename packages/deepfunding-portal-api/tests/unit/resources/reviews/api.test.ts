import { describe, expect, it } from 'vitest';
import { fetchReviews } from '../../../../src/resources/reviews/api.js';
import type { ReviewApiResponse } from '../../../../src/resources/reviews/types.js';
import { createMockClient } from '../../../utils/api-helpers.js';
import { createMockReview } from '../../../utils/mock-helpers.js';

describe('Review API', () => {
  describe('fetchReviews', () => {
    it('should fetch reviews with pagination', async () => {
      const review1 = createMockReview({ proposal_id: 1 });
      const review2 = createMockReview({ proposal_id: 2 });

      const mockResponse: ReviewApiResponse = {
        reviews: [review1, review2],
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
      for await (const page of fetchReviews(client)) {
        results.push(...page.data);
      }

      expect(results.length).toBe(2);
      expect(client.mockGet).toHaveBeenCalledWith('/reviews', { page: 1, limit: 500 });
    });
  });
});
