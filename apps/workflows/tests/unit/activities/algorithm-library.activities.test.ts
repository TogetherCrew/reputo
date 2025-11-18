/**
 * Unit tests for algorithm library activities.
 */

import { describe, expect, it, vi } from 'vitest';
import { createAlgorithmLibraryActivities } from '../../../src/activities/algorithm-library.activities.js';

// Mock the reputation-algorithms package
vi.mock('@reputo/reputation-algorithms', () => ({
  getAlgorithmDefinition: vi.fn((filters: { key: string; version?: string }) => {
    if (filters.key === 'voting_engagement') {
      return JSON.stringify({
        key: 'voting_engagement',
        name: 'Voting Engagement',
        category: 'engagement',
        description: 'Scores users based on voting activity',
        version: '1.0.0',
        inputs: [
          {
            key: 'votes',
            type: 'csv',
            csv: {
              hasHeader: true,
              delimiter: ',',
              columns: [
                { key: 'user_id', type: 'string', required: true },
                { key: 'vote_count', type: 'number', required: true },
              ],
            },
          },
        ],
        outputs: [
          {
            key: 'scores',
            type: 'csv',
            csv: {
              hasHeader: true,
              delimiter: ',',
              columns: [
                { key: 'user_id', type: 'string', required: true },
                { key: 'score', type: 'number', required: true },
              ],
            },
          },
        ],
        runtime: {
          taskQueue: 'typescript-worker',
          activity: 'voting_engagement',
        },
      });
    }
    throw new Error('Algorithm not found');
  }),
}));

describe('Algorithm Library Activities', () => {
  describe('getAlgorithmDefinition', () => {
    it('should load algorithm definition successfully', async () => {
      const activities = createAlgorithmLibraryActivities();

      // Mock Context.current()
      vi.mock('@temporalio/activity', () => ({
        Context: {
          current: () => ({
            log: {
              info: vi.fn(),
              error: vi.fn(),
              warn: vi.fn(),
            },
          }),
        },
      }));

      const result = await activities.getAlgorithmDefinition({
        key: 'voting_engagement',
        version: '1.0.0',
      });

      expect(result.definition).toMatchObject({
        key: 'voting_engagement',
        version: '1.0.0',
        runtime: {
          taskQueue: 'typescript-worker',
          activity: 'voting_engagement',
        },
      });
    });

    it('should throw error if algorithm not found', async () => {
      const activities = createAlgorithmLibraryActivities();

      // Mock Context.current()
      vi.mock('@temporalio/activity', () => ({
        Context: {
          current: () => ({
            log: {
              info: vi.fn(),
              error: vi.fn(),
              warn: vi.fn(),
            },
          }),
        },
      }));

      await expect(
        activities.getAlgorithmDefinition({
          key: 'nonexistent',
          version: '1.0.0',
        }),
      ).rejects.toThrow('Algorithm definition not found: nonexistent@1.0.0');
    });
  });
});
