import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateCSVContent, validatePayload } from '@reputo/algorithm-validator';
import { MODEL_NAMES } from '@reputo/database';
import { getAlgorithmDefinition } from '@reputo/reputation-algorithms';
import type { StorageMetadata } from '@reputo/storage';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlgorithmPresetRepository } from '../../../src/algorithm-preset/algorithm-preset.repository';
import { AlgorithmPresetService } from '../../../src/algorithm-preset/algorithm-preset.service';
import type {
  CreateAlgorithmPresetDto,
  ListAlgorithmPresetsQueryDto,
  UpdateAlgorithmPresetDto,
} from '../../../src/algorithm-preset/dto';
import { CSVValidationException } from '../../../src/shared/exceptions';
import { StorageService } from '../../../src/storage/storage.service';

vi.mock('@reputo/reputation-algorithms', async () => {
  const actual = await vi.importActual('@reputo/reputation-algorithms');
  return {
    ...actual,
    getAlgorithmDefinition: vi.fn(),
  };
});

vi.mock('@reputo/algorithm-validator', async () => {
  const actual = await vi.importActual('@reputo/algorithm-validator');
  return {
    ...actual,
    validateCSVContent: vi.fn(),
    validatePayload: vi.fn(),
  };
});

describe('AlgorithmPresetService', () => {
  let service: AlgorithmPresetService;
  let mockRepository: AlgorithmPresetRepository;
  let mockStorageService: StorageService;
  let mockConfigService: ConfigService;

  const defaultStorageConfig = {
    maxSizeBytes: 52428800, // 50MB
    contentTypeAllowlist: 'text/csv,text/plain',
  };

  const mockAlgorithmDefinition = {
    key: 'test_key',
    name: 'Test Algorithm',
    category: 'Test',
    description: 'Test algorithm definition',
    version: '1.0.0',
    inputs: [
      {
        key: 'input1',
        label: 'Input 1',
        description: 'Test input',
        type: 'csv',
        csv: {
          hasHeader: true,
          delimiter: ',',
          columns: [
            {
              key: 'column1',
              type: 'string',
              required: true,
            },
          ],
        },
      },
    ],
    outputs: [],
    runtime: {
      taskQueue: 'test-queue',
      activity: 'test-activity',
    },
  };

  const validMetadata: StorageMetadata = {
    filename: 'test.csv',
    ext: 'csv',
    size: 1024,
    contentType: 'text/csv',
    timestamp: Date.now(),
  };

  const validCsvBuffer = Buffer.from('column1\nvalue1\n');

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      updateById: vi.fn(),
      deleteById: vi.fn(),
    } as unknown as AlgorithmPresetRepository;

    mockStorageService = {
      getObjectMetadata: vi.fn().mockResolvedValue(validMetadata),
      getObject: vi.fn().mockResolvedValue(validCsvBuffer),
    } as unknown as StorageService;

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'storage.maxSizeBytes') return defaultStorageConfig.maxSizeBytes;
        if (key === 'storage.contentTypeAllowlist') return defaultStorageConfig.contentTypeAllowlist;
        return undefined;
      }),
    } as unknown as ConfigService;

    vi.mocked(getAlgorithmDefinition).mockReturnValue(JSON.stringify(mockAlgorithmDefinition));

    vi.mocked(validatePayload).mockReturnValue({
      success: true,
      data: {},
    });

    vi.mocked(validateCSVContent).mockResolvedValue({
      valid: true,
      errors: [],
    });

    service = new AlgorithmPresetService(mockRepository, mockStorageService, mockConfigService);
  });

  describe('create', () => {
    it('should delegate to repository.create with the provided DTO', async () => {
      const createDto: CreateAlgorithmPresetDto = {
        key: 'test_key',
        version: '1.0.0',
        inputs: [{ key: 'input1', value: 'uploads/test.csv' }],
      };

      const mockPreset = { _id: '507f1f77bcf86cd799439011', ...createDto };
      mockRepository.create = vi.fn().mockResolvedValue(mockPreset);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledOnce();
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(result).toBe(mockPreset);
    });

    it('should validate storage metadata and CSV content for csv inputs', async () => {
      const createDto: CreateAlgorithmPresetDto = {
        key: 'test_key',
        version: '1.0.0',
        inputs: [{ key: 'input1', value: 'uploads/test.csv' }],
      };

      const mockPreset = { _id: '507f1f77bcf86cd799439011', ...createDto };
      mockRepository.create = vi.fn().mockResolvedValue(mockPreset);

      await service.create(createDto);

      expect(mockStorageService.getObjectMetadata).toHaveBeenCalledWith('uploads/test.csv');
      expect(mockStorageService.getObject).toHaveBeenCalledWith('uploads/test.csv');
      expect(validateCSVContent).toHaveBeenCalledWith(validCsvBuffer, mockAlgorithmDefinition.inputs[0].csv);
    });
  });

  describe('validateStorageInputs - metadata validation', () => {
    it('should throw CSVValidationException when content type is not allowed', async () => {
      const createDto: CreateAlgorithmPresetDto = {
        key: 'test_key',
        version: '1.0.0',
        inputs: [{ key: 'input1', value: 'uploads/test.csv' }],
      };

      const invalidMetadata: StorageMetadata = {
        ...validMetadata,
        contentType: 'application/json',
      };
      mockStorageService.getObjectMetadata = vi.fn().mockResolvedValue(invalidMetadata);

      await expect(service.create(createDto)).rejects.toThrow(CSVValidationException);

      try {
        await service.create(createDto);
      } catch (error) {
        expect(error).toBeInstanceOf(CSVValidationException);
        const response = (error as CSVValidationException).getResponse() as any;
        expect(response.errors[0].inputKey).toBe('input1');
        expect(response.errors[0].errors[0]).toContain('Invalid content type');
        expect(response.errors[0].errors[0]).toContain('application/json');
      }
    });

    it('should throw CSVValidationException when file exceeds API config maxSizeBytes', async () => {
      const createDto: CreateAlgorithmPresetDto = {
        key: 'test_key',
        version: '1.0.0',
        inputs: [{ key: 'input1', value: 'uploads/test.csv' }],
      };

      const oversizedMetadata: StorageMetadata = {
        ...validMetadata,
        size: defaultStorageConfig.maxSizeBytes + 1,
      };
      mockStorageService.getObjectMetadata = vi.fn().mockResolvedValue(oversizedMetadata);

      await expect(service.create(createDto)).rejects.toThrow(CSVValidationException);

      try {
        await service.create(createDto);
      } catch (error) {
        const response = (error as CSVValidationException).getResponse() as any;
        expect(response.errors[0].errors).toContainEqual(expect.stringContaining('exceeds API limit'));
      }
    });

    it('should throw CSVValidationException when file exceeds algorithm definition maxBytes', async () => {
      const definitionWithMaxBytes = {
        ...mockAlgorithmDefinition,
        inputs: [
          {
            ...mockAlgorithmDefinition.inputs[0],
            csv: {
              ...mockAlgorithmDefinition.inputs[0].csv,
              maxBytes: 500, // 500 bytes limit
            },
          },
        ],
      };

      vi.mocked(getAlgorithmDefinition).mockReturnValue(JSON.stringify(definitionWithMaxBytes));

      const createDto: CreateAlgorithmPresetDto = {
        key: 'test_key',
        version: '1.0.0',
        inputs: [{ key: 'input1', value: 'uploads/test.csv' }],
      };

      // Metadata size is 1024 bytes, which exceeds the 500 byte limit
      await expect(service.create(createDto)).rejects.toThrow(CSVValidationException);

      try {
        await service.create(createDto);
      } catch (error) {
        const response = (error as CSVValidationException).getResponse() as any;
        expect(response.errors[0].errors).toContainEqual(expect.stringContaining('exceeds algorithm limit'));
      }
    });

    it('should allow files within both API and algorithm definition limits', async () => {
      const definitionWithMaxBytes = {
        ...mockAlgorithmDefinition,
        inputs: [
          {
            ...mockAlgorithmDefinition.inputs[0],
            csv: {
              ...mockAlgorithmDefinition.inputs[0].csv,
              maxBytes: 2000, // 2000 bytes limit
            },
          },
        ],
      };

      vi.mocked(getAlgorithmDefinition).mockReturnValue(JSON.stringify(definitionWithMaxBytes));

      const createDto: CreateAlgorithmPresetDto = {
        key: 'test_key',
        version: '1.0.0',
        inputs: [{ key: 'input1', value: 'uploads/test.csv' }],
      };

      const mockPreset = { _id: '507f1f77bcf86cd799439011', ...createDto };
      mockRepository.create = vi.fn().mockResolvedValue(mockPreset);

      // Metadata size is 1024 bytes, which is within the 2000 byte limit
      const result = await service.create(createDto);

      expect(result).toBe(mockPreset);
    });
  });

  describe('validateStorageInputs - CSV content validation', () => {
    it('should throw CSVValidationException when CSV content is invalid', async () => {
      const createDto: CreateAlgorithmPresetDto = {
        key: 'test_key',
        version: '1.0.0',
        inputs: [{ key: 'input1', value: 'uploads/test.csv' }],
      };

      vi.mocked(validateCSVContent).mockResolvedValue({
        valid: false,
        errors: ['Missing required column: column1'],
      });

      await expect(service.create(createDto)).rejects.toThrow(CSVValidationException);

      try {
        await service.create(createDto);
      } catch (error) {
        const response = (error as CSVValidationException).getResponse() as any;
        expect(response.errors[0].inputKey).toBe('input1');
        expect(response.errors[0].errors).toContain('Missing required column: column1');
      }
    });

    it('should collect multiple CSV validation errors', async () => {
      const createDto: CreateAlgorithmPresetDto = {
        key: 'test_key',
        version: '1.0.0',
        inputs: [{ key: 'input1', value: 'uploads/test.csv' }],
      };

      vi.mocked(validateCSVContent).mockResolvedValue({
        valid: false,
        errors: ['Missing required column: column1', 'CSV must contain at least one data row'],
      });

      try {
        await service.create(createDto);
      } catch (error) {
        const response = (error as CSVValidationException).getResponse() as any;
        expect(response.errors[0].errors).toHaveLength(2);
        expect(response.errors[0].errors).toContain('Missing required column: column1');
        expect(response.errors[0].errors).toContain('CSV must contain at least one data row');
      }
    });
  });

  describe('validateStorageInputs - multiple errors collection', () => {
    it('should collect metadata and CSV content errors together', async () => {
      const createDto: CreateAlgorithmPresetDto = {
        key: 'test_key',
        version: '1.0.0',
        inputs: [{ key: 'input1', value: 'uploads/test.csv' }],
      };

      // Invalid content type
      const invalidMetadata: StorageMetadata = {
        ...validMetadata,
        contentType: 'application/octet-stream',
      };
      mockStorageService.getObjectMetadata = vi.fn().mockResolvedValue(invalidMetadata);

      // Also invalid CSV content
      vi.mocked(validateCSVContent).mockResolvedValue({
        valid: false,
        errors: ['Missing required column: column1'],
      });

      try {
        await service.create(createDto);
      } catch (error) {
        const response = (error as CSVValidationException).getResponse() as any;
        expect(response.errors[0].errors.length).toBeGreaterThanOrEqual(2);
        expect(response.errors[0].errors).toContainEqual(expect.stringContaining('Invalid content type'));
        expect(response.errors[0].errors).toContain('Missing required column: column1');
      }
    });

    it('should collect errors from multiple CSV inputs', async () => {
      const multiInputDefinition = {
        ...mockAlgorithmDefinition,
        inputs: [
          {
            key: 'input1',
            type: 'csv',
            csv: {
              hasHeader: true,
              delimiter: ',',
              columns: [{ key: 'col1', type: 'string', required: true }],
            },
          },
          {
            key: 'input2',
            type: 'csv',
            csv: {
              hasHeader: true,
              delimiter: ',',
              columns: [{ key: 'col2', type: 'string', required: true }],
            },
          },
        ],
      };

      vi.mocked(getAlgorithmDefinition).mockReturnValue(JSON.stringify(multiInputDefinition));

      const createDto: CreateAlgorithmPresetDto = {
        key: 'test_key',
        version: '1.0.0',
        inputs: [
          { key: 'input1', value: 'uploads/file1.csv' },
          { key: 'input2', value: 'uploads/file2.csv' },
        ],
      };

      vi.mocked(validateCSVContent)
        .mockResolvedValueOnce({
          valid: false,
          errors: ['Error in file 1'],
        })
        .mockResolvedValueOnce({
          valid: false,
          errors: ['Error in file 2'],
        });

      try {
        await service.create(createDto);
      } catch (error) {
        const response = (error as CSVValidationException).getResponse() as any;
        expect(response.errors).toHaveLength(2);
        expect(response.errors[0].inputKey).toBe('input1');
        expect(response.errors[0].errors).toContain('Error in file 1');
        expect(response.errors[1].inputKey).toBe('input2');
        expect(response.errors[1].errors).toContain('Error in file 2');
      }
    });
  });

  describe('validateStorageInputs - skip non-CSV inputs', () => {
    it('should skip validation for non-csv input types', async () => {
      const mixedInputDefinition = {
        ...mockAlgorithmDefinition,
        inputs: [
          {
            key: 'numberInput',
            type: 'number',
          },
          {
            key: 'csvInput',
            type: 'csv',
            csv: {
              hasHeader: true,
              delimiter: ',',
              columns: [{ key: 'col1', type: 'string', required: true }],
            },
          },
        ],
      };

      vi.mocked(getAlgorithmDefinition).mockReturnValue(JSON.stringify(mixedInputDefinition));

      const createDto: CreateAlgorithmPresetDto = {
        key: 'test_key',
        version: '1.0.0',
        inputs: [
          { key: 'numberInput', value: 42 },
          { key: 'csvInput', value: 'uploads/test.csv' },
        ],
      };

      const mockPreset = { _id: '507f1f77bcf86cd799439011', ...createDto };
      mockRepository.create = vi.fn().mockResolvedValue(mockPreset);

      await service.create(createDto);

      // Should only call storage methods once (for the CSV input)
      expect(mockStorageService.getObjectMetadata).toHaveBeenCalledTimes(1);
      expect(mockStorageService.getObject).toHaveBeenCalledTimes(1);
      expect(mockStorageService.getObjectMetadata).toHaveBeenCalledWith('uploads/test.csv');
    });
  });

  describe('list', () => {
    it('should filter by key and version from queryDto', async () => {
      const queryDto: ListAlgorithmPresetsQueryDto = {
        key: 'test_key',
        version: '1.0.0',
        page: 1,
        limit: 10,
      };

      const mockPaginatedResult = {
        results: [],
        totalResults: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockRepository.findAll = vi.fn().mockResolvedValue(mockPaginatedResult);

      const result = await service.list(queryDto);

      expect(mockRepository.findAll).toHaveBeenCalledOnce();
      const [filter, options] = (mockRepository.findAll as any).mock.calls[0];
      expect(filter).toEqual({ key: 'test_key', version: '1.0.0' });
      expect(options).toMatchObject({ page: 1, limit: 10 });
      expect(result).toBe(mockPaginatedResult);
    });

    it('should filter with pagination options including sortBy', async () => {
      const queryDto: ListAlgorithmPresetsQueryDto = {
        key: 'test_key',
        page: 2,
        limit: 20,
        sortBy: 'createdAt:desc',
      };

      const mockPaginatedResult = {
        results: [],
        totalResults: 50,
        page: 2,
        limit: 20,
        totalPages: 3,
      };

      mockRepository.findAll = vi.fn().mockResolvedValue(mockPaginatedResult);

      const result = await service.list(queryDto);

      const [, options] = (mockRepository.findAll as any).mock.calls[0];
      expect(options).toMatchObject({
        page: 2,
        limit: 20,
        sortBy: 'createdAt:desc',
      });
      expect(result).toBe(mockPaginatedResult);
    });

    it('should handle empty queryDto with no filters', async () => {
      const queryDto: ListAlgorithmPresetsQueryDto = {};

      const mockPaginatedResult = {
        results: [],
        totalResults: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockRepository.findAll = vi.fn().mockResolvedValue(mockPaginatedResult);

      const result = await service.list(queryDto);

      const [filter] = (mockRepository.findAll as any).mock.calls[0];
      expect(filter).toEqual({});
      expect(result).toBe(mockPaginatedResult);
    });
  });

  describe('getById', () => {
    it('should return preset when found', async () => {
      const id = '507f1f77bcf86cd799439011';
      const mockPreset = {
        _id: id,
        key: 'test_key',
        version: '1.0.0',
      };

      mockRepository.findById = vi.fn().mockResolvedValue(mockPreset);

      const result = await service.getById(id);

      expect(mockRepository.findById).toHaveBeenCalledOnce();
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toBe(mockPreset);
    });

    it('should throw NotFoundException when preset not found', async () => {
      const id = '507f1f77bcf86cd799439011';

      mockRepository.findById = vi.fn().mockResolvedValue(null);

      const promise = service.getById(id);

      await expect(promise).rejects.toBeInstanceOf(NotFoundException);
      await expect(promise).rejects.toThrow(`${MODEL_NAMES.ALGORITHM_PRESET} with ID ${id} not found`);
    });
  });

  describe('updateById', () => {
    it('should return updated preset when found', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto: UpdateAlgorithmPresetDto = {
        name: 'Updated Name',
        description: 'Updated description',
      };

      const mockUpdatedPreset = {
        _id: id,
        key: 'test_key',
        version: '1.0.0',
        ...updateDto,
      };

      mockRepository.updateById = vi.fn().mockResolvedValue(mockUpdatedPreset);

      const result = await service.updateById(id, updateDto);

      expect(mockRepository.updateById).toHaveBeenCalledOnce();
      expect(mockRepository.updateById).toHaveBeenCalledWith(id, updateDto);
      expect(result).toBe(mockUpdatedPreset);
    });

    it('should throw NotFoundException when preset not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto: UpdateAlgorithmPresetDto = { name: 'Updated' };

      mockRepository.updateById = vi.fn().mockResolvedValue(null);

      const promise = service.updateById(id, updateDto);

      await expect(promise).rejects.toBeInstanceOf(NotFoundException);
      await expect(promise).rejects.toThrow(`${MODEL_NAMES.ALGORITHM_PRESET} with ID ${id} not found`);
    });
  });

  describe('deleteById', () => {
    it('should complete successfully when preset is deleted', async () => {
      const id = '507f1f77bcf86cd799439011';

      mockRepository.deleteById = vi.fn().mockResolvedValue({ _id: id });

      await service.deleteById(id);

      expect(mockRepository.deleteById).toHaveBeenCalledOnce();
      expect(mockRepository.deleteById).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when preset not found', async () => {
      const id = '507f1f77bcf86cd799439011';

      mockRepository.deleteById = vi.fn().mockResolvedValue(null);

      const promise = service.deleteById(id);

      await expect(promise).rejects.toBeInstanceOf(NotFoundException);
      await expect(promise).rejects.toThrow(`${MODEL_NAMES.ALGORITHM_PRESET} with ID ${id} not found`);
    });
  });
});
