import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { AlgorithmPreset } from '../../../src/interfaces/index.js';
import AlgorithmPresetModel from '../../../src/models/AlgorithmPreset.model.js';

describe('AlgorithmPreset model', () => {
  describe('AlgorithmPreset validation', () => {
    let algorithmPreset: AlgorithmPreset;

    beforeEach(() => {
      algorithmPreset = {
        key: 'test-algorithm',
        version: '1.0.0',

        inputs: [
          {
            key: 'threshold',
            value: 0.5,
          },
        ],
        name: 'Test Algorithm Preset',
        description: 'A test algorithm preset for validation',
      };
    });

    test('should correctly validate a valid algorithm preset', async () => {
      const doc = new AlgorithmPresetModel(algorithmPreset);
      await expect(doc.validate()).resolves.toBeUndefined();
    });
  });

  describe('AlgorithmPreset pagination', () => {
    test('should have paginate method', () => {
      expect(AlgorithmPresetModel.paginate).toBeDefined();
      expect(typeof AlgorithmPresetModel.paginate).toBe('function');
    });

    test('should paginate with custom page and limit', async () => {
      const mockResults = [{ spec: { key: 'algo-3', version: '2.0.0' } }];
      const mockTotalCount = 50;

      const mockExec = vi.fn();
      const mockLean = vi.fn().mockReturnValue({ exec: mockExec });
      const mockLimit = vi.fn().mockReturnValue({ lean: mockLean });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = vi.fn().mockReturnValue({ skip: mockSkip });
      const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
      const mockCountExec = vi.fn().mockResolvedValue(mockTotalCount);
      const mockCountDocuments = vi.fn().mockReturnValue({ exec: mockCountExec });

      mockExec.mockResolvedValue(mockResults);

      vi.spyOn(AlgorithmPresetModel, 'find').mockImplementation(mockFind);
      vi.spyOn(AlgorithmPresetModel, 'countDocuments').mockImplementation(mockCountDocuments);

      const result = await AlgorithmPresetModel.paginate({}, { page: 3, limit: 20 });

      expect(result.page).toBe(3);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(3);
      expect(mockSkip).toHaveBeenCalledWith(40);

      vi.restoreAllMocks();
    });

    test('should handle string page and limit parameters', async () => {
      const mockResults = [];
      const mockTotalCount = 15;

      const mockExec = vi.fn();
      const mockLean = vi.fn().mockReturnValue({ exec: mockExec });
      const mockLimit = vi.fn().mockReturnValue({ lean: mockLean });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = vi.fn().mockReturnValue({ skip: mockSkip });
      const mockFind = vi.fn().mockReturnValue({ sort: mockSort });
      const mockCountExec = vi.fn().mockResolvedValue(mockTotalCount);
      const mockCountDocuments = vi.fn().mockReturnValue({ exec: mockCountExec });

      mockExec.mockResolvedValue(mockResults);

      vi.spyOn(AlgorithmPresetModel, 'find').mockImplementation(mockFind);
      vi.spyOn(AlgorithmPresetModel, 'countDocuments').mockImplementation(mockCountDocuments);

      const result = await AlgorithmPresetModel.paginate({}, { page: '2', limit: '5' });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(mockSkip).toHaveBeenCalledWith(5);

      vi.restoreAllMocks();
    });

    test('should sort by field ascending', async () => {
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

      vi.spyOn(AlgorithmPresetModel, 'find').mockImplementation(mockFind);
      vi.spyOn(AlgorithmPresetModel, 'countDocuments').mockImplementation(mockCountDocuments);

      await AlgorithmPresetModel.paginate({}, { sortBy: 'name:asc', page: 1, limit: 10 });

      expect(mockSort).toHaveBeenCalledWith('name');

      vi.restoreAllMocks();
    });

    test('should sort by field descending', async () => {
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

      vi.spyOn(AlgorithmPresetModel, 'find').mockImplementation(mockFind);
      vi.spyOn(AlgorithmPresetModel, 'countDocuments').mockImplementation(mockCountDocuments);

      await AlgorithmPresetModel.paginate({}, { sortBy: 'createdAt:desc', page: 1, limit: 10 });

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

      vi.spyOn(AlgorithmPresetModel, 'find').mockImplementation(mockFind);
      vi.spyOn(AlgorithmPresetModel, 'countDocuments').mockImplementation(mockCountDocuments);

      await AlgorithmPresetModel.paginate({}, { sortBy: 'name:asc,createdAt:desc', page: 1, limit: 10 });

      expect(mockSort).toHaveBeenCalledWith('name -createdAt');

      vi.restoreAllMocks();
    });

    test('should handle filter queries', async () => {
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

      vi.spyOn(AlgorithmPresetModel, 'find').mockImplementation(mockFind);
      vi.spyOn(AlgorithmPresetModel, 'countDocuments').mockImplementation(mockCountDocuments);

      const filter = { 'spec.key': 'voting_engagement' };
      await AlgorithmPresetModel.paginate(filter, {});

      expect(mockFind).toHaveBeenCalledWith(filter);
      expect(mockCountDocuments).toHaveBeenCalledWith(filter);

      vi.restoreAllMocks();
    });
  });
});
