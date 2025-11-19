import { beforeEach, describe, expect, test, vi } from 'vitest';
import SnapshotModel from '../../../src/models/Snapshot.model.js';
import type { Snapshot } from '../../../src/shared/types/index.js';

describe('Snapshot model', () => {
  describe('Snapshot validation', () => {
    let snapshot: Snapshot;

    beforeEach(() => {
      snapshot = {
        status: 'queued',
        algorithmPreset: '507f1f77bcf86cd799439011',
        algorithmPresetFrozen: {
          key: 'voting_engagement',
          version: '1.0.0',
          inputs: [
            { key: 'threshold', value: 0.5 },
            { key: 'minVotes', value: 10 },
          ],
          name: 'Voting Engagement Algorithm',
          description: 'Calculates engagement based on voting patterns',
        },
        temporal: {
          workflowId: 'workflow-123',
          runId: 'run-456',
          taskQueue: 'snapshot-queue',
        },
        outputs: {
          csv: 's3://bucket/path/to/result.csv',
        },
      };
    });

    test('should correctly validate a valid snapshot', async () => {
      const doc = new SnapshotModel(snapshot);
      await expect(doc.validate()).resolves.toBeUndefined();
    });
  });

  describe('Snapshot pagination', () => {
    test('should have paginate method', () => {
      expect(SnapshotModel.paginate).toBeDefined();
      expect(typeof SnapshotModel.paginate).toBe('function');
    });

    test('should paginate with custom page and limit', async () => {
      const mockResults = [
        {
          status: 'failed',
          algorithmPresetFrozen: {
            key: 'test_key',
            version: '1.0.0',
            inputs: [],
          },
        },
      ];
      const mockTotalCount = 100;

      const mockExec = vi.fn();
      const mockLean = vi.fn().mockReturnValue({ exec: mockExec });
      const mockLimit = vi.fn().mockReturnValue({ lean: mockLean });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = vi.fn().mockReturnValue({ skip: mockSkip });
      const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
      const mockCountExec = vi.fn().mockResolvedValue(mockTotalCount);
      const mockCountDocuments = vi.fn().mockReturnValue({ exec: mockCountExec });

      mockExec.mockResolvedValue(mockResults);

      vi.spyOn(SnapshotModel, 'find').mockImplementation(mockFind);
      vi.spyOn(SnapshotModel, 'countDocuments').mockImplementation(mockCountDocuments);

      const result = await SnapshotModel.paginate({}, { page: 5, limit: 25 });

      expect(result.page).toBe(5);
      expect(result.limit).toBe(25);
      expect(result.totalPages).toBe(4);
      expect(mockSkip).toHaveBeenCalledWith(100);

      vi.restoreAllMocks();
    });

    test('should filter by status', async () => {
      const mockResults = [];
      const mockTotalCount = 10;

      const mockExec = vi.fn();
      const mockLean = vi.fn().mockReturnValue({ exec: mockExec });
      const mockLimit = vi.fn().mockReturnValue({ lean: mockLean });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = vi.fn().mockReturnValue({ skip: mockSkip });
      const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
      const mockCountExec = vi.fn().mockResolvedValue(mockTotalCount);
      const mockCountDocuments = vi.fn().mockReturnValue({ exec: mockCountExec });

      mockExec.mockResolvedValue(mockResults);

      vi.spyOn(SnapshotModel, 'find').mockImplementation(mockFind);
      vi.spyOn(SnapshotModel, 'countDocuments').mockImplementation(mockCountDocuments);

      const filter = { status: 'completed' };
      await SnapshotModel.paginate(filter, {});

      expect(mockFind).toHaveBeenCalledWith(filter);
      expect(mockCountDocuments).toHaveBeenCalledWith(filter);

      vi.restoreAllMocks();
    });

    test('should filter by algorithmPresetFrozen.key', async () => {
      const mockResults = [];
      const mockTotalCount = 5;

      const mockExec = vi.fn();
      const mockLean = vi.fn().mockReturnValue({ exec: mockExec });
      const mockLimit = vi.fn().mockReturnValue({ lean: mockLean });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = vi.fn().mockReturnValue({ skip: mockSkip });
      const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
      const mockCountExec = vi.fn().mockResolvedValue(mockTotalCount);
      const mockCountDocuments = vi.fn().mockReturnValue({ exec: mockCountExec });

      mockExec.mockResolvedValue(mockResults);

      vi.spyOn(SnapshotModel, 'find').mockImplementation(mockFind);
      vi.spyOn(SnapshotModel, 'countDocuments').mockImplementation(mockCountDocuments);

      const filter = { 'algorithmPresetFrozen.key': 'voting_engagement' };
      await SnapshotModel.paginate(filter, {});

      expect(mockFind).toHaveBeenCalledWith(filter);
      expect(mockCountDocuments).toHaveBeenCalledWith(filter);

      vi.restoreAllMocks();
    });

    test('should filter by algorithmPresetFrozen.version', async () => {
      const mockResults = [];
      const mockTotalCount = 3;

      const mockExec = vi.fn();
      const mockLean = vi.fn().mockReturnValue({ exec: mockExec });
      const mockLimit = vi.fn().mockReturnValue({ lean: mockLean });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = vi.fn().mockReturnValue({ skip: mockSkip });
      const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
      const mockCountExec = vi.fn().mockResolvedValue(mockTotalCount);
      const mockCountDocuments = vi.fn().mockReturnValue({ exec: mockCountExec });

      mockExec.mockResolvedValue(mockResults);

      vi.spyOn(SnapshotModel, 'find').mockImplementation(mockFind);
      vi.spyOn(SnapshotModel, 'countDocuments').mockImplementation(mockCountDocuments);

      const filter = { 'algorithmPresetFrozen.version': '1.0.0' };
      await SnapshotModel.paginate(filter, {});

      expect(mockFind).toHaveBeenCalledWith(filter);
      expect(mockCountDocuments).toHaveBeenCalledWith(filter);

      vi.restoreAllMocks();
    });

    test('should sort by status ascending', async () => {
      const mockResults = [];
      const mockTotalCount = 0;

      const mockExec = vi.fn();
      const mockLean = vi.fn().mockReturnValue({ exec: mockExec });
      const mockLimit = vi.fn().mockReturnValue({ lean: mockLean });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = vi.fn().mockReturnValue({ skip: mockSkip });
      const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
      const mockCountExec = vi.fn().mockResolvedValue(mockTotalCount);
      const mockCountDocuments = vi.fn().mockReturnValue({ exec: mockCountExec });

      mockExec.mockResolvedValue(mockResults);

      vi.spyOn(SnapshotModel, 'find').mockImplementation(mockFind);
      vi.spyOn(SnapshotModel, 'countDocuments').mockImplementation(mockCountDocuments);

      await SnapshotModel.paginate({}, { sortBy: 'status:asc' });

      expect(mockSort).toHaveBeenCalledWith('status');

      vi.restoreAllMocks();
    });

    test('should sort by createdAt descending', async () => {
      const mockResults = [];
      const mockTotalCount = 0;

      const mockExec = vi.fn();
      const mockLean = vi.fn().mockReturnValue({ exec: mockExec });
      const mockLimit = vi.fn().mockReturnValue({ lean: mockLean });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = vi.fn().mockReturnValue({ skip: mockSkip });
      const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
      const mockCountExec = vi.fn().mockResolvedValue(mockTotalCount);
      const mockCountDocuments = vi.fn().mockReturnValue({ exec: mockCountExec });

      mockExec.mockResolvedValue(mockResults);

      vi.spyOn(SnapshotModel, 'find').mockImplementation(mockFind);
      vi.spyOn(SnapshotModel, 'countDocuments').mockImplementation(mockCountDocuments);

      await SnapshotModel.paginate({}, { sortBy: 'createdAt:desc' });

      expect(mockSort).toHaveBeenCalledWith('-createdAt');

      vi.restoreAllMocks();
    });

    test('should handle multiple sort criteria', async () => {
      const mockResults = [];
      const mockTotalCount = 0;

      const mockExec = vi.fn();
      const mockLean = vi.fn().mockReturnValue({ exec: mockExec });
      const mockLimit = vi.fn().mockReturnValue({ lean: mockLean });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = vi.fn().mockReturnValue({ skip: mockSkip });
      const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
      const mockCountExec = vi.fn().mockResolvedValue(mockTotalCount);
      const mockCountDocuments = vi.fn().mockReturnValue({ exec: mockCountExec });

      mockExec.mockResolvedValue(mockResults);

      vi.spyOn(SnapshotModel, 'find').mockImplementation(mockFind);
      vi.spyOn(SnapshotModel, 'countDocuments').mockImplementation(mockCountDocuments);

      await SnapshotModel.paginate({}, { sortBy: 'status:asc,createdAt:desc' });

      expect(mockSort).toHaveBeenCalledWith('status -createdAt');

      vi.restoreAllMocks();
    });
  });
});
