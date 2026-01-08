import { describe, expect, it } from 'vitest';
import { fetchUsers } from '../../../../src/resources/users/api.js';
import type { UserApiResponse } from '../../../../src/resources/users/types.js';
import { createMockClient } from '../../../utils/api-helpers.js';
import { createMockUser } from '../../../utils/mock-helpers.js';

describe('User API', () => {
  describe('fetchUsers', () => {
    it('should fetch users with pagination', async () => {
      const user1 = createMockUser({ id: 1 });
      const user2 = createMockUser({ id: 2 });

      const mockResponse: UserApiResponse = {
        users: [user1, user2],
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
      for await (const page of fetchUsers(client)) {
        results.push(...page.data);
      }

      expect(results.length).toBe(2);
      expect(client.mockGet).toHaveBeenCalledWith('/users', { page: 1, limit: 500 });
    });

    it('should handle multiple pages', async () => {
      const client = createMockClient();

      client.mockGet
        .mockResolvedValueOnce({
          users: [createMockUser({ id: 1 })],
          pagination: {
            current_page: 1,
            next_page: 2,
            prev_page: null,
            total_pages: 2,
            total_count: 2,
          },
        })
        .mockResolvedValueOnce({
          users: [createMockUser({ id: 2 })],
          pagination: {
            current_page: 2,
            next_page: null,
            prev_page: 1,
            total_pages: 2,
            total_count: 2,
          },
        });

      const results: unknown[] = [];
      for await (const page of fetchUsers(client)) {
        results.push(...page.data);
      }

      expect(results.length).toBe(2);
      expect(client.mockGet).toHaveBeenCalledTimes(2);
    });
  });
});
