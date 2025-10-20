import { Types } from 'mongoose';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Snapshot } from '../../../src/interfaces/index.js';
import SnapshotModel from '../../../src/models/Snapshot.model.js';

describe('Snapshot model', () => {
  describe('Snapshot validation', () => {
    let snapshot: Snapshot;
    let algorithmPresetId: Types.ObjectId;

    beforeEach(() => {
      algorithmPresetId = new Types.ObjectId();
      snapshot = {
        status: 'queued',
        algorithmPreset: algorithmPresetId,
        temporal: {
          workflowId: 'workflow-123',
          runId: 'run-456',
          taskQueue: 'snapshot-queue',
        },
        outputs: {
          result: 'success',
          data: [1, 2, 3],
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
      const mockResults = [{ status: 'failed', algorithmPreset: new Types.ObjectId() }];
      const mockTotalCount = 100;

      const mockExec = vi.fn();
      const mockLimit = vi.fn().mockReturnValue({ exec: mockExec });
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
      expect(result.totalPages).toBe(4); // Math.ceil(100 / 25)
      expect(mockSkip).toHaveBeenCalledWith(100); // (5 - 1) * 25

      vi.restoreAllMocks();
    });

    test('should filter by status', async () => {
      const mockResults = [];
      const mockTotalCount = 10;

      const mockExec = vi.fn();
      const mockLimit = vi.fn().mockReturnValue({ exec: mockExec });
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

    test('should filter by algorithmPreset reference', async () => {
      const mockResults = [];
      const mockTotalCount = 5;
      const presetId = new Types.ObjectId();

      const mockExec = vi.fn();
      const mockLimit = vi.fn().mockReturnValue({ exec: mockExec });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = vi.fn().mockReturnValue({ skip: mockSkip });
      const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
      const mockCountExec = vi.fn().mockResolvedValue(mockTotalCount);
      const mockCountDocuments = vi.fn().mockReturnValue({ exec: mockCountExec });

      mockExec.mockResolvedValue(mockResults);

      vi.spyOn(SnapshotModel, 'find').mockImplementation(mockFind);
      vi.spyOn(SnapshotModel, 'countDocuments').mockImplementation(mockCountDocuments);

      const filter = { algorithmPreset: presetId };
      await SnapshotModel.paginate(filter, {});

      expect(mockFind).toHaveBeenCalledWith(filter);
      expect(mockCountDocuments).toHaveBeenCalledWith(filter);

      vi.restoreAllMocks();
    });

    test('should sort by status ascending', async () => {
      const mockResults = [];
      const mockTotalCount = 0;

      const mockExec = vi.fn();
      const mockLimit = vi.fn().mockReturnValue({ exec: mockExec });
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
      const mockLimit = vi.fn().mockReturnValue({ exec: mockExec });
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

    test('should handle populate option with string', async () => {
      const mockResults = [];
      const mockTotalCount = 0;

      const mockExec = vi.fn();
      const mockPopulate = vi.fn().mockReturnValue({ exec: mockExec });
      const mockLimit = vi.fn().mockReturnValue({ populate: mockPopulate });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = vi.fn().mockReturnValue({ skip: mockSkip });
      const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
      const mockCountExec = vi.fn().mockResolvedValue(mockTotalCount);
      const mockCountDocuments = vi.fn().mockReturnValue({ exec: mockCountExec });

      mockExec.mockResolvedValue(mockResults);

      vi.spyOn(SnapshotModel, 'find').mockImplementation(mockFind);
      vi.spyOn(SnapshotModel, 'countDocuments').mockImplementation(mockCountDocuments);

      await SnapshotModel.paginate({}, { populate: 'algorithmPreset' });

      expect(mockPopulate).toHaveBeenCalledWith('algorithmPreset');

      vi.restoreAllMocks();
    });

    test('should handle populate option with object', async () => {
      const mockResults = [];
      const mockTotalCount = 0;

      const mockExec = vi.fn();
      const mockPopulate = vi.fn().mockReturnValue({ exec: mockExec });
      const mockLimit = vi.fn().mockReturnValue({ populate: mockPopulate });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = vi.fn().mockReturnValue({ skip: mockSkip });
      const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
      const mockCountExec = vi.fn().mockResolvedValue(mockTotalCount);
      const mockCountDocuments = vi.fn().mockReturnValue({ exec: mockCountExec });

      mockExec.mockResolvedValue(mockResults);

      vi.spyOn(SnapshotModel, 'find').mockImplementation(mockFind);
      vi.spyOn(SnapshotModel, 'countDocuments').mockImplementation(mockCountDocuments);

      const populateOptions = {
        path: 'algorithmPreset',
        select: 'name spec',
      };
      await SnapshotModel.paginate({}, { populate: populateOptions });

      expect(mockPopulate).toHaveBeenCalledWith(populateOptions);

      vi.restoreAllMocks();
    });

    test('should handle populate option with array', async () => {
      const mockResults = [];
      const mockTotalCount = 0;

      const mockExec = vi.fn();
      const mockPopulate = vi.fn();
      // Create a chain where populate returns itself to allow chaining
      const populateChain = {
        populate: mockPopulate,
        exec: mockExec,
      };
      mockPopulate.mockReturnValue(populateChain);

      const mockLimit = vi.fn().mockReturnValue(populateChain);
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = vi.fn().mockReturnValue({ skip: mockSkip });
      const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
      const mockCountExec = vi.fn().mockResolvedValue(mockTotalCount);
      const mockCountDocuments = vi.fn().mockReturnValue({ exec: mockCountExec });

      mockExec.mockResolvedValue(mockResults);

      vi.spyOn(SnapshotModel, 'find').mockImplementation(mockFind);
      vi.spyOn(SnapshotModel, 'countDocuments').mockImplementation(mockCountDocuments);

      await SnapshotModel.paginate({}, { populate: ['algorithmPreset', 'temporal'] });

      expect(mockPopulate).toHaveBeenCalledTimes(2);
      expect(mockPopulate).toHaveBeenCalledWith('algorithmPreset');
      expect(mockPopulate).toHaveBeenCalledWith('temporal');

      vi.restoreAllMocks();
    });

    test('should handle multiple sort criteria', async () => {
      const mockResults = [];
      const mockTotalCount = 0;

      const mockExec = vi.fn();
      const mockLimit = vi.fn().mockReturnValue({ exec: mockExec });
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
