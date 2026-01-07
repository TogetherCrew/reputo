/**
 * Unit tests for database activities.
 */

import type { Snapshot } from '@reputo/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDbActivities } from '../../../src/activities/orchestrator/database.activities.js';

const { mockFindById, mockFindByIdAndUpdate } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockFindByIdAndUpdate: vi.fn(),
}));

vi.mock('@reputo/database', async () => {
  const actual = await vi.importActual('@reputo/database');
  return {
    ...actual,
    SnapshotModelValue: {
      findById: mockFindById,
      findByIdAndUpdate: mockFindByIdAndUpdate,
    },
  };
});

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

describe('Database Activities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSnapshot', () => {
    it('should fetch a snapshot successfully', async () => {
      // Mock snapshot data
      const mockSnapshot: Snapshot = {
        status: 'queued',
        algorithmPreset: '507f1f77bcf86cd799439011',
        algorithmPresetFrozen: {
          key: 'voting_engagement',
          version: '1.0.0',
          inputs: [{ key: 'votes', value: 's3://bucket/votes.csv' }],
        },
      };

      // Mock Mongoose model chain
      mockFindById.mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSnapshot),
        }),
      });

      // Create activities
      const activities = createDbActivities();

      // Execute activity
      const result = await activities.getSnapshot({
        snapshotId: '507f1f77bcf86cd799439011',
      });

      // Assertions
      expect(result.snapshot).toEqual(mockSnapshot);
      expect(mockFindById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw error if snapshot not found', async () => {
      // Mock Mongoose model to return null
      mockFindById.mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
        }),
      });

      const activities = createDbActivities();

      // Execute activity and expect error
      await expect(activities.getSnapshot({ snapshotId: 'nonexistent' })).rejects.toThrow(
        'Snapshot not found: nonexistent',
      );
    });
  });

  describe('updateSnapshot', () => {
    it('should update snapshot status successfully', async () => {
      const updatedSnapshot: Snapshot = {
        status: 'running',
        algorithmPreset: '507f1f77bcf86cd799439011',
        algorithmPresetFrozen: {
          key: 'voting_engagement',
          version: '1.0.0',
          inputs: [],
        },
        temporal: {
          workflowId: 'workflow-123',
          runId: 'run-456',
          taskQueue: 'workflows',
        },
      };

      mockFindByIdAndUpdate.mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(updatedSnapshot),
        }),
      });

      const activities = createDbActivities();

      await activities.updateSnapshot({
        snapshotId: '507f1f77bcf86cd799439011',
        status: 'running',
        temporal: {
          workflowId: 'workflow-123',
          runId: 'run-456',
          taskQueue: 'workflows',
        },
      });

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.objectContaining({
          $set: expect.objectContaining({
            status: 'running',
          }),
        }),
        { new: true },
      );
    });
  });
});
