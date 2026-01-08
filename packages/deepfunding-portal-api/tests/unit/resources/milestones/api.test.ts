import { describe, expect, it } from 'vitest';
import { fetchMilestones } from '../../../../src/resources/milestones/api.js';
import type { MilestoneApiResponse } from '../../../../src/resources/milestones/types.js';
import { createMockClient } from '../../../utils/api-helpers.js';
import { createMockMilestoneRaw } from '../../../utils/mock-helpers.js';

describe('Milestone API', () => {
  describe('fetchMilestones', () => {
    it('should fetch milestones with pagination', async () => {
      const milestone1 = createMockMilestoneRaw({ id: 1 });
      const milestone2 = createMockMilestoneRaw({ id: 2 });

      const mockResponse: MilestoneApiResponse = {
        milestones: [
          {
            proposal_id: 100,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
            milestones: [milestone1, milestone2],
          },
        ],
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

      const results: Array<{ data: unknown[]; pagination: unknown }> = [];
      for await (const page of fetchMilestones(client)) {
        results.push(page);
      }

      expect(results.length).toBe(1);
      expect(results[0]?.data.length).toBe(2);
      expect(client.mockGet).toHaveBeenCalledWith('/milestones', { page: 1, limit: 500 });
    });

    it('should flatten nested milestone structure', async () => {
      const milestone1 = createMockMilestoneRaw({ id: 1, title: 'Milestone 1' });
      const milestone2 = createMockMilestoneRaw({ id: 2, title: 'Milestone 2' });

      const mockResponse: MilestoneApiResponse = {
        milestones: [
          {
            proposal_id: 100,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
            milestones: [milestone1, milestone2],
          },
        ],
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
      for await (const page of fetchMilestones(client)) {
        results.push(...page.data);
      }

      expect(results.length).toBe(2);
      const first = results[0] as { proposal_id: number; created_at: string; updated_at: string };
      expect(first.proposal_id).toBe(100);
      expect(first.created_at).toBe('2024-01-01T00:00:00Z');
      expect(first.updated_at).toBe('2024-01-02T00:00:00Z');
    });

    it('should handle multiple pages', async () => {
      const client = createMockClient();

      client.mockGet
        .mockResolvedValueOnce({
          milestones: [
            {
              proposal_id: 100,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-02T00:00:00Z',
              milestones: [createMockMilestoneRaw({ id: 1 })],
            },
          ],
          pagination: {
            current_page: 1,
            next_page: 2,
            prev_page: null,
            total_pages: 2,
            total_count: 2,
          },
        })
        .mockResolvedValueOnce({
          milestones: [
            {
              proposal_id: 200,
              created_at: '2024-01-03T00:00:00Z',
              updated_at: '2024-01-04T00:00:00Z',
              milestones: [createMockMilestoneRaw({ id: 2 })],
            },
          ],
          pagination: {
            current_page: 2,
            next_page: null,
            prev_page: 1,
            total_pages: 2,
            total_count: 2,
          },
        });

      const results: unknown[] = [];
      for await (const page of fetchMilestones(client)) {
        results.push(...page.data);
      }

      expect(results.length).toBe(2);
      expect(client.mockGet).toHaveBeenCalledTimes(2);
    });

    it('should use custom page and limit options', async () => {
      const client = createMockClient();
      client.mockGet.mockResolvedValue({
        milestones: [],
        pagination: {
          current_page: 2,
          next_page: null,
          prev_page: 1,
          total_pages: 2,
          total_count: 0,
        },
      });

      const results: unknown[] = [];
      for await (const page of fetchMilestones(client, { page: 2, limit: 10 })) {
        results.push(...page.data);
      }

      expect(client.mockGet).toHaveBeenCalledWith('/milestones', { page: 2, limit: 10 });
    });
  });
});
