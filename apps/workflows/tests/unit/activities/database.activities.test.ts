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
    it('should fetch a snapshot successfully and include _id as string', async () => {
      const snapshotId = '507f1f77bcf86cd799439011';
      // Mock lean() result with ObjectId-like _id that has toString()
      const mockLeanSnapshot = {
        _id: { toString: () => snapshotId },
        status: 'queued' as const,
        algorithmPreset: snapshotId,
        algorithmPresetFrozen: {
          key: 'voting_engagement',
          version: '1.0.0',
          inputs: [{ key: 'votes', value: 's3://bucket/votes.csv' }],
        },
      };

      // Mock Mongoose model chain: findById().lean().exec()
      mockFindById.mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockLeanSnapshot),
        }),
      });

      const activities = createDbActivities();

      const result = await activities.getSnapshot({ snapshotId });

      // _id should be serialized as a plain string
      expect(result.snapshot._id).toBe(snapshotId);
      expect(result.snapshot.status).toBe('queued');
      expect(result.snapshot.algorithmPresetFrozen.key).toBe('voting_engagement');
      expect(mockFindById).toHaveBeenCalledWith(snapshotId);
    });

    it('should throw error if snapshot not found', async () => {
      mockFindById.mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
        }),
      });

      const activities = createDbActivities();

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

    it('should set error.timestamp when updating with error', async () => {
      const updatedSnapshot: Snapshot = {
        status: 'failed',
        algorithmPreset: '507f1f77bcf86cd799439011',
        algorithmPresetFrozen: {
          key: 'voting_engagement',
          version: '1.0.0',
          inputs: [],
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
        status: 'failed',
        error: { message: 'Algorithm failed' },
      });

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.objectContaining({
          $set: expect.objectContaining({
            status: 'failed',
            error: {
              message: 'Algorithm failed',
              timestamp: expect.any(String),
            },
          }),
        }),
        { new: true },
      );
    });
  });
});
