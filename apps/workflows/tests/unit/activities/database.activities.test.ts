/**
 * Unit tests for database activities.
 */

import type { Snapshot } from '@reputo/database';
import type { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDatabaseActivities } from '../../../src/activities/database.activities.js';

describe('Database Activities', () => {
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

      // Mock Mongoose model
      const mockModel = {
        findById: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue(mockSnapshot),
          }),
        }),
      } as unknown as Model<Snapshot>;

      // Create activities with mocked model
      const activities = createDatabaseActivities(mockModel);

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

      // Execute activity
      const result = await activities.getSnapshot({
        snapshotId: '507f1f77bcf86cd799439011',
      });

      // Assertions
      expect(result.snapshot).toEqual(mockSnapshot);
      expect(mockModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw error if snapshot not found', async () => {
      // Mock Mongoose model to return null
      const mockModel = {
        findById: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue(null),
          }),
        }),
      } as unknown as Model<Snapshot>;

      const activities = createDatabaseActivities(mockModel);

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

      // Execute activity and expect error
      await expect(activities.getSnapshot({ snapshotId: 'nonexistent' })).rejects.toThrow(
        'Snapshot not found: nonexistent',
      );
    });
  });

  describe('updateSnapshot', () => {
    it('should update snapshot status successfully', async () => {
      const updatedSnapshot: Snapshot = {
        status: 'processing',
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

      const mockModel = {
        findByIdAndUpdate: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue(updatedSnapshot),
          }),
        }),
      } as unknown as Model<Snapshot>;

      const activities = createDatabaseActivities(mockModel);

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

      await activities.updateSnapshot({
        snapshotId: '507f1f77bcf86cd799439011',
        status: 'processing',
        temporal: {
          workflowId: 'workflow-123',
          runId: 'run-456',
          taskQueue: 'workflows',
        },
      });

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.objectContaining({
          $set: expect.objectContaining({
            status: 'processing',
          }),
        }),
        { new: true },
      );
    });
  });
});
