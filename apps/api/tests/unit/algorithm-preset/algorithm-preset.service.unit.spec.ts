import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateAlgorithmPreset } from '@reputo/algorithm-validator';
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
import { StorageInputValidationException } from '../../../src/shared/exceptions';
import { SnapshotRepository } from '../../../src/snapshot/snapshot.repository';
import { StorageService } from '../../../src/storage/storage.service';
import { TemporalService } from '../../../src/temporal';

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
    validateAlgorithmPreset: vi.fn(),
  };
});

describe('AlgorithmPresetService', () => {
  let service: AlgorithmPresetService;
  let mockRepository: AlgorithmPresetRepository;
  let mockStorageService: StorageService;
  let mockConfigService: ConfigService;
  let mockSnapshotRepository: SnapshotRepository;
  let mockTemporalService: TemporalService;
  let mockConnection: any;
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    log: vi.fn(),
    setContext: vi.fn(),
  } as any;

  const defaultStorageConfig = {
    maxSizeBytes: 52428800, // 50MB
    contentTypeAllowlist: 'text/csv,text/plain,application/json',
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
      listObjectsByPrefix: vi.fn().mockResolvedValue([]),
      deleteObjects: vi.fn().mockResolvedValue({ deleted: [], errors: [] }),
    } as unknown as StorageService;

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'storage.maxSizeBytes') return defaultStorageConfig.maxSizeBytes;
        if (key === 'storage.contentTypeAllowlist') return defaultStorageConfig.contentTypeAllowlist;
        return undefined;
      }),
    } as unknown as ConfigService;

    mockSnapshotRepository = {
      find: vi.fn().mockResolvedValue([]),
      deleteMany: vi.fn().mockResolvedValue({ deletedCount: 0 }),
    } as unknown as SnapshotRepository;

    mockTemporalService = {
      cancelSnapshotWorkflows: vi.fn().mockResolvedValue(undefined),
      terminateSnapshotWorkflows: vi.fn().mockResolvedValue(undefined),
    } as unknown as TemporalService;

    const session = {
      withTransaction: vi.fn(async (cb: () => Promise<void>) => cb()),
      endSession: vi.fn(),
    };
    mockConnection = {
      startSession: vi.fn().mockResolvedValue(session),
    };

    vi.mocked(getAlgorithmDefinition).mockReturnValue(JSON.stringify(mockAlgorithmDefinition));

    vi.mocked(validateAlgorithmPreset).mockResolvedValue({
      success: true,
      data: {
        preset: {},
        payload: {},
      },
    });

    service = new AlgorithmPresetService(
      mockLogger,
      mockRepository,
      mockStorageService,
      mockSnapshotRepository,
      mockTemporalService,
      mockConnection,
      mockConfigService,
    );
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
      expect(validateAlgorithmPreset).toHaveBeenCalledWith(
        expect.objectContaining({
          definition: expect.objectContaining({
            key: 'test_key',
            version: '1.0.0',
          }),
          preset: expect.objectContaining({
            key: 'test_key',
            version: '1.0.0',
            inputs: createDto.inputs,
          }),
        }),
      );
    });
  });

  describe('validateStorageInputs - metadata validation', () => {
    it('should throw StorageInputValidationException when the uploaded file does not match the csv input type', async () => {
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

      await expect(service.create(createDto)).rejects.toThrow(StorageInputValidationException);

      try {
        await service.create(createDto);
      } catch (error) {
        expect(error).toBeInstanceOf(StorageInputValidationException);
        const response = (error as StorageInputValidationException).getResponse() as any;
        expect(response.errors[0].inputKey).toBe('input1');
        expect(response.errors[0].errors[0]).toContain('must be a CSV file');
      }
    });

    it('should throw StorageInputValidationException when file exceeds API config maxSizeBytes', async () => {
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

      await expect(service.create(createDto)).rejects.toThrow(StorageInputValidationException);

      try {
        await service.create(createDto);
      } catch (error) {
        const response = (error as StorageInputValidationException).getResponse() as any;
        expect(response.errors[0].errors).toContainEqual(expect.stringContaining('exceeds API limit'));
      }
    });

    it('should throw StorageInputValidationException when file exceeds algorithm definition maxBytes', async () => {
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
      await expect(service.create(createDto)).rejects.toThrow(StorageInputValidationException);

      try {
        await service.create(createDto);
      } catch (error) {
        const response = (error as StorageInputValidationException).getResponse() as any;
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
    it('should throw StorageInputValidationException when CSV content is invalid', async () => {
      const createDto: CreateAlgorithmPresetDto = {
        key: 'test_key',
        version: '1.0.0',
        inputs: [{ key: 'input1', value: 'uploads/test.csv' }],
      };

      vi.mocked(validateAlgorithmPreset).mockResolvedValue({
        success: false,
        errors: [{ field: 'input1', message: 'Missing required column: column1', source: 'file' }],
      });

      await expect(service.create(createDto)).rejects.toThrow(StorageInputValidationException);

      try {
        await service.create(createDto);
      } catch (error) {
        const response = (error as StorageInputValidationException).getResponse() as any;
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

      vi.mocked(validateAlgorithmPreset).mockResolvedValue({
        success: false,
        errors: [
          { field: 'input1', message: 'Missing required column: column1', source: 'file' },
          { field: 'input1', message: 'CSV must contain at least one data row', source: 'file' },
        ],
      });

      try {
        await service.create(createDto);
      } catch (error) {
        const response = (error as StorageInputValidationException).getResponse() as any;
        expect(response.errors[0].errors).toHaveLength(2);
        expect(response.errors[0].errors).toContain('Missing required column: column1');
        expect(response.errors[0].errors).toContain('CSV must contain at least one data row');
      }
    });
  });

  describe('validateStorageInputs - multiple errors collection', () => {
    it('should stop before shared validation when metadata is invalid', async () => {
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

      try {
        await service.create(createDto);
      } catch (error) {
        const response = (error as StorageInputValidationException).getResponse() as any;
        expect(response.errors[0].errors).toContainEqual(expect.stringContaining('Invalid content type'));
      }

      expect(validateAlgorithmPreset).not.toHaveBeenCalled();
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

      vi.mocked(validateAlgorithmPreset).mockResolvedValue({
        success: false,
        errors: [
          { field: 'input1', message: 'Error in file 1', source: 'file' },
          { field: 'input2', message: 'Error in file 2', source: 'file' },
        ],
      });

      try {
        await service.create(createDto);
      } catch (error) {
        const response = (error as StorageInputValidationException).getResponse() as any;
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

  describe('validateStorageInputs - JSON content validation', () => {
    it('should validate storage metadata and JSON content for json inputs', async () => {
      const jsonDefinition = {
        ...mockAlgorithmDefinition,
        inputs: [
          {
            key: 'wallets',
            label: 'Wallet Addresses JSON',
            description: 'Wallet input',
            type: 'json',
            required: true,
            json: {
              maxBytes: 5242880,
              schema: 'wallet_address_map',
              rootKey: 'wallets',
              allowedChains: ['ethereum', 'cardano'],
            },
          },
        ],
      };
      vi.mocked(getAlgorithmDefinition).mockReturnValue(JSON.stringify(jsonDefinition));

      const jsonMetadata: StorageMetadata = {
        filename: 'wallets.json',
        ext: 'json',
        size: 512,
        contentType: 'application/json',
        timestamp: Date.now(),
      };
      const validJsonBuffer = Buffer.from(
        JSON.stringify({
          wallets: {
            ethereum: ['0x1234567890abcdef1234567890abcdef12345678'],
          },
        }),
        'utf-8',
      );

      mockStorageService.getObjectMetadata = vi.fn().mockResolvedValue(jsonMetadata);
      mockStorageService.getObject = vi.fn().mockResolvedValue(validJsonBuffer);

      const createDto: CreateAlgorithmPresetDto = {
        key: 'test_key',
        version: '1.0.0',
        inputs: [{ key: 'wallets', value: 'uploads/wallets.json' }],
      };

      const mockPreset = { _id: '507f1f77bcf86cd799439011', ...createDto };
      mockRepository.create = vi.fn().mockResolvedValue(mockPreset);

      await service.create(createDto);

      expect(mockStorageService.getObjectMetadata).toHaveBeenCalledWith('uploads/wallets.json');
      expect(mockStorageService.getObject).toHaveBeenCalledWith('uploads/wallets.json');
      expect(validateAlgorithmPreset).toHaveBeenCalledWith(
        expect.objectContaining({
          definition: expect.objectContaining({
            key: 'test_key',
          }),
        }),
      );
    });

    it('should surface shared rule errors when selected chains have no wallets in the uploaded json', async () => {
      const tokenValueDefinition = {
        key: 'token_value_over_time',
        name: 'Token Value Over Time',
        category: 'Activity',
        summary: 'Test algorithm summary',
        description: 'Test algorithm definition',
        version: '1.0.0',
        inputs: [
          {
            key: 'wallets',
            label: 'Wallet Addresses JSON',
            description: 'Wallet input',
            type: 'json',
            required: true,
            json: {
              maxBytes: 5242880,
              schema: 'wallet_address_map',
              rootKey: 'wallets',
              allowedChains: ['ethereum', 'cardano'],
            },
          },
          {
            key: 'selected_resources',
            label: 'Resources',
            description: 'Selected resources',
            type: 'array',
            required: true,
            minItems: 1,
            uniqueBy: ['chain', 'resource_key'],
            uiHint: {
              widget: 'resource_selector',
              resourceCatalog: {
                chains: [
                  {
                    key: 'ethereum',
                    label: 'Ethereum',
                    resources: [
                      {
                        key: 'fet_token',
                        label: 'FET',
                        kind: 'token',
                        identifier: '0xaaa',
                        tokenIdentifier: '0xaaa',
                        tokenKey: 'fet',
                      },
                    ],
                  },
                  {
                    key: 'cardano',
                    label: 'Cardano',
                    resources: [
                      {
                        key: 'fet_token',
                        label: 'FET',
                        kind: 'token',
                        identifier: 'asset1',
                        tokenIdentifier: 'asset1',
                        tokenKey: 'fet',
                      },
                    ],
                  },
                ],
              },
            },
            item: {
              type: 'object',
              properties: [
                { key: 'chain', label: 'Chain', description: 'Chain', type: 'string', required: true },
                {
                  key: 'resource_key',
                  label: 'Resource',
                  description: 'Resource key',
                  type: 'string',
                  required: true,
                },
              ],
            },
          },
        ],
        outputs: [],
        runtime: 'typescript',
        validation: {
          rules: [
            {
              kind: 'json_chain_coverage',
              walletInputKey: 'wallets',
              selectorInputKey: 'selected_resources',
              selectorChainField: 'chain',
            },
          ],
        },
      };
      vi.mocked(getAlgorithmDefinition).mockReturnValue(JSON.stringify(tokenValueDefinition));

      const jsonMetadata: StorageMetadata = {
        filename: 'wallets.json',
        ext: 'json',
        size: 512,
        contentType: 'application/json',
        timestamp: Date.now(),
      };
      const ethereumOnlyWallets = Buffer.from(
        JSON.stringify({
          wallets: {
            ethereum: ['0x1234567890abcdef1234567890abcdef12345678'],
          },
        }),
        'utf-8',
      );

      mockStorageService.getObjectMetadata = vi.fn().mockResolvedValue(jsonMetadata);
      mockStorageService.getObject = vi.fn().mockResolvedValue(ethereumOnlyWallets);
      vi.mocked(validateAlgorithmPreset).mockResolvedValue({
        success: false,
        errors: [
          {
            field: 'wallets',
            message: 'Wallet JSON is missing wallet addresses for selected chain(s): cardano',
            source: 'rule',
          },
        ],
      });

      const createDto: CreateAlgorithmPresetDto = {
        key: 'token_value_over_time',
        version: '1.0.0',
        inputs: [
          { key: 'wallets', value: 'uploads/wallets.json' },
          {
            key: 'selected_resources',
            value: [
              {
                chain: 'cardano',
                resource_key: 'fet_token',
              },
            ],
          },
        ],
      };

      await expect(service.create(createDto)).rejects.toThrow(StorageInputValidationException);

      try {
        await service.create(createDto);
      } catch (error) {
        const response = (error as StorageInputValidationException).getResponse() as any;
        expect(response.errors[0].inputKey).toBe('wallets');
        expect(response.errors[0].errors).toContain(
          'Wallet JSON is missing wallet addresses for selected chain(s): cardano',
        );
      }
    });

    it('should reject stale selected_targets presets with a recreate message', async () => {
      vi.mocked(getAlgorithmDefinition).mockReturnValue(
        JSON.stringify({
          key: 'token_value_over_time',
          name: 'Token Value Over Time',
          category: 'Activity',
          summary: 'Test algorithm summary',
          description: 'Test algorithm definition',
          version: '1.0.0',
          inputs: [
            {
              key: 'selected_resources',
              label: 'Resources',
              description: 'Selected resources',
              type: 'array',
              required: true,
              item: {
                type: 'object',
                properties: [{ key: 'chain', label: 'Chain', description: 'Chain', type: 'string', required: true }],
              },
            },
          ],
          outputs: [],
          runtime: 'typescript',
        }),
      );
      vi.mocked(validateAlgorithmPreset).mockResolvedValue({
        success: false,
        errors: [
          {
            field: 'selected_targets',
            message:
              'Input "selected_targets" is not supported by token_value_over_time@1.0.0. Recreate the preset using the current algorithm definition.',
            source: 'definition',
          },
        ],
      });

      await expect(
        service.create({
          key: 'token_value_over_time',
          version: '1.0.0',
          inputs: [{ key: 'selected_targets', value: [] }],
        }),
      ).rejects.toThrow(BadRequestException);
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

      mockRepository.findById = vi.fn().mockResolvedValue({
        _id: id,
        key: 'test_key',
        version: '1.0.0',
        inputs: [{ key: 'input1', value: 'uploads/test.csv' }],
      });
      mockRepository.updateById = vi.fn().mockResolvedValue(mockUpdatedPreset);

      const result = await service.updateById(id, updateDto);

      expect(mockStorageService.getObjectMetadata).toHaveBeenCalledWith('uploads/test.csv');
      expect(mockRepository.updateById).toHaveBeenCalledOnce();
      expect(mockRepository.updateById).toHaveBeenCalledWith(id, updateDto);
      expect(result).toBe(mockUpdatedPreset);
    });

    it('should throw NotFoundException when preset not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto: UpdateAlgorithmPresetDto = { name: 'Updated' };

      mockRepository.findById = vi.fn().mockResolvedValue(null);

      const promise = service.updateById(id, updateDto);

      await expect(promise).rejects.toBeInstanceOf(NotFoundException);
      await expect(promise).rejects.toThrow(`${MODEL_NAMES.ALGORITHM_PRESET} with ID ${id} not found`);
    });
  });

  describe('deleteById', () => {
    it('should complete successfully when preset is deleted', async () => {
      const id = '507f1f77bcf86cd799439011';

      mockRepository.findById = vi.fn().mockResolvedValue({ _id: id, inputs: [] });
      mockSnapshotRepository.find = vi.fn().mockResolvedValue([]);
      mockRepository.deleteById = vi.fn().mockResolvedValue({ _id: id });

      await service.deleteById(id);

      expect(mockTemporalService.terminateSnapshotWorkflows).toHaveBeenCalledWith([], true);
      expect(mockSnapshotRepository.deleteMany).not.toHaveBeenCalled();
      expect(mockRepository.deleteById).toHaveBeenCalled();
    });

    it('should throw NotFoundException when preset not found', async () => {
      const id = '507f1f77bcf86cd799439011';

      mockRepository.findById = vi.fn().mockResolvedValue(null);

      const promise = service.deleteById(id);

      await expect(promise).rejects.toBeInstanceOf(NotFoundException);
      await expect(promise).rejects.toThrow(`${MODEL_NAMES.ALGORITHM_PRESET} with ID ${id} not found`);
    });

    it('should cascade delete snapshots, terminate workflows, and clean S3', async () => {
      const id = '507f1f77bcf86cd799439011';
      const preset = {
        _id: id,
        inputs: [
          { key: 'votes', value: 'uploads/uuid-1/votes.csv' },
          { key: 'config', value: 'some-value' }, // non-upload value
        ],
      };
      const snapshots = [
        { _id: 's1', status: 'completed' },
        {
          _id: 's2',
          status: 'running',
          temporal: { workflowId: 'wf-1' },
        },
      ];

      mockRepository.findById = vi.fn().mockResolvedValue(preset);
      mockSnapshotRepository.find = vi.fn().mockResolvedValue(snapshots);
      mockRepository.deleteById = vi.fn().mockResolvedValue({ _id: id });
      mockStorageService.listObjectsByPrefix = vi
        .fn()
        .mockResolvedValueOnce(['snapshots/s1/output1.csv'])
        .mockResolvedValueOnce(['snapshots/s2/output2.json', 'snapshots/s2/output3.csv']);
      mockStorageService.deleteObjects = vi.fn().mockResolvedValue({
        deleted: [
          'uploads/uuid-1/votes.csv',
          'snapshots/s1/output1.csv',
          'snapshots/s2/output2.json',
          'snapshots/s2/output3.csv',
        ],
        errors: [],
      });

      await service.deleteById(id);

      // Verify workflows terminated
      expect(mockTemporalService.terminateSnapshotWorkflows).toHaveBeenCalledWith(snapshots, true);

      // Verify DB cascade delete
      expect(mockSnapshotRepository.deleteMany).toHaveBeenCalled();
      const [filter] = (mockSnapshotRepository.deleteMany as any).mock.calls[0];
      expect(filter).toEqual({ algorithmPreset: id });
      expect(mockRepository.deleteById).toHaveBeenCalled();

      // Verify S3 cleanup
      expect(mockStorageService.listObjectsByPrefix).toHaveBeenCalledWith('snapshots/s1/');
      expect(mockStorageService.listObjectsByPrefix).toHaveBeenCalledWith('snapshots/s2/');
      expect(mockStorageService.deleteObjects).toHaveBeenCalledWith([
        'uploads/uuid-1/votes.csv',
        'snapshots/s1/output1.csv',
        'snapshots/s2/output2.json',
        'snapshots/s2/output3.csv',
      ]);
    });

    it('should handle S3 cleanup failures gracefully', async () => {
      const id = '507f1f77bcf86cd799439011';
      const preset = {
        _id: id,
        inputs: [{ key: 'votes', value: 'uploads/uuid-1/votes.csv' }],
      };

      mockRepository.findById = vi.fn().mockResolvedValue(preset);
      mockSnapshotRepository.find = vi.fn().mockResolvedValue([]);
      mockRepository.deleteById = vi.fn().mockResolvedValue({ _id: id });
      mockStorageService.deleteObjects = vi.fn().mockRejectedValue(new Error('S3 error'));

      // Should not throw even if S3 cleanup fails
      await expect(service.deleteById(id)).resolves.not.toThrow();

      // DB operations should still complete
      expect(mockRepository.deleteById).toHaveBeenCalled();
    });

    it('should handle partial S3 deletion failures', async () => {
      const id = '507f1f77bcf86cd799439011';
      const preset = {
        _id: id,
        inputs: [{ key: 'votes', value: 'uploads/uuid-1/votes.csv' }],
      };
      const snapshots = [{ _id: 's1', status: 'completed' }];

      mockRepository.findById = vi.fn().mockResolvedValue(preset);
      mockSnapshotRepository.find = vi.fn().mockResolvedValue(snapshots);
      mockRepository.deleteById = vi.fn().mockResolvedValue({ _id: id });
      mockStorageService.listObjectsByPrefix = vi.fn().mockResolvedValue(['snapshots/s1/output.csv']);
      mockStorageService.deleteObjects = vi.fn().mockResolvedValue({
        deleted: ['uploads/uuid-1/votes.csv'],
        errors: [{ key: 'snapshots/s1/output.csv', message: 'Access denied' }],
      });

      await service.deleteById(id);

      // Should complete successfully despite partial S3 failure
      expect(mockRepository.deleteById).toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
});
