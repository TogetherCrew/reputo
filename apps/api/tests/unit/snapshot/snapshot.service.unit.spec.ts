import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateAlgorithmPreset } from '@reputo/algorithm-validator';
import { MODEL_NAMES } from '@reputo/database';
import { getAlgorithmDefinition } from '@reputo/reputation-algorithms';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlgorithmPresetRepository } from '../../../src/algorithm-preset/algorithm-preset.repository';
import type { CreateSnapshotDto, ListSnapshotsQueryDto } from '../../../src/snapshot/dto';
import { SnapshotRepository } from '../../../src/snapshot/snapshot.repository';
import { SnapshotService } from '../../../src/snapshot/snapshot.service';
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
    validateAlgorithmPreset: vi.fn(),
  };
});

describe('SnapshotService', () => {
  const tokenValueOverTimeDefinition = {
    key: 'token_value_over_time',
    name: 'Token Value Over Time',
    category: 'Activity',
    summary: 'Tracks token holdings over time.',
    description: 'Measures long-held token value.',
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
        label: 'Resources to Include',
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
                    identifier: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
                    tokenIdentifier: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
                    tokenKey: 'fet',
                  },
                  {
                    key: 'fet_staking_1',
                    label: 'FET Staking 1',
                    kind: 'contract',
                    identifier: '0xCB85b101C4822A4E3ABCa20e57f1DFf0E2673475',
                    tokenIdentifier: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
                    tokenKey: 'fet',
                    parentResourceKey: 'fet_token',
                  },
                  {
                    key: 'fet_staking_2',
                    label: 'FET Staking 2',
                    kind: 'contract',
                    identifier: '0x351baC612B50e87B46e4b10A282f632D41397DE2',
                    tokenIdentifier: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
                    tokenKey: 'fet',
                    parentResourceKey: 'fet_token',
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
                    identifier: 'e824c0011176f0926ad51f492bcc63ac6a03a589653520839dc7e3d9',
                    tokenIdentifier: 'e824c0011176f0926ad51f492bcc63ac6a03a589653520839dc7e3d9',
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
            { key: 'chain', label: 'Chain', type: 'string', required: true },
            { key: 'resource_key', label: 'Resource', type: 'string', required: true },
          ],
        },
      },
    ],
    outputs: [],
    runtime: 'typescript',
  };

  let service: SnapshotService;
  let mockSnapshotRepository: SnapshotRepository;
  let mockAlgorithmPresetRepository: AlgorithmPresetRepository;
  let mockTemporalService: {
    startSnapshotWorkflow: ReturnType<typeof vi.fn>;
    cancelSnapshotWorkflow: ReturnType<typeof vi.fn>;
    terminateSnapshotWorkflow: ReturnType<typeof vi.fn>;
  };
  let mockStorageService: StorageService;
  let mockConfigService: ConfigService;
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    log: vi.fn(),
    setContext: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSnapshotRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      deleteById: vi.fn(),
    } as unknown as SnapshotRepository;

    mockAlgorithmPresetRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
    } as unknown as AlgorithmPresetRepository;

    mockTemporalService = {
      startSnapshotWorkflow: vi.fn().mockResolvedValue(undefined),
      cancelSnapshotWorkflow: vi.fn().mockResolvedValue(undefined),
      terminateSnapshotWorkflow: vi.fn().mockResolvedValue(undefined),
    };

    mockStorageService = {
      getObjectMetadata: vi.fn(),
      getObject: vi.fn(),
      listObjectsByPrefix: vi.fn().mockResolvedValue([]),
      deleteObjects: vi.fn().mockResolvedValue({ deleted: [], errors: [] }),
    } as unknown as StorageService;

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'storage.maxSizeBytes') return 52428800;
        if (key === 'storage.contentTypeAllowlist') return 'text/csv,text/plain,application/json';
        return undefined;
      }),
    } as unknown as ConfigService;

    vi.mocked(getAlgorithmDefinition).mockReturnValue(
      JSON.stringify({
        key: 'test_key',
        name: 'Test Algorithm',
        category: 'Activity',
        summary: 'Test',
        description: 'Test algorithm',
        version: '1.0.0',
        inputs: [],
        outputs: [],
        runtime: 'typescript',
      }),
    );
    vi.mocked(validateAlgorithmPreset).mockResolvedValue({
      success: true,
      data: {
        preset: {},
        payload: {},
      },
    });

    service = new SnapshotService(
      mockLogger,
      mockSnapshotRepository,
      mockAlgorithmPresetRepository,
      mockTemporalService as any,
      mockStorageService,
      mockConfigService,
    );
  });

  describe('create', () => {
    it('should create snapshot with frozen algorithmPreset when preset exists', async () => {
      const createDto: CreateSnapshotDto = {
        algorithmPresetId: '507f1f77bcf86cd799439011',
      };

      const mockAlgorithmPreset = {
        _id: '507f1f77bcf86cd799439011',
        key: 'test_key',
        version: '1.0.0',
        inputs: [{ key: 'param1', value: 'value1' }],
        name: 'Test Preset',
        description: 'Test description for preset',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSnapshot = {
        _id: '507f1f77bcf86cd799439012',
        algorithmPreset: '507f1f77bcf86cd799439011',
        algorithmPresetFrozen: {
          key: 'test_key',
          version: '1.0.0',
          inputs: [{ key: 'param1', value: 'value1' }],
          name: 'Test Preset',
          description: 'Test description for preset',
        },
        status: 'queued',
      };

      mockAlgorithmPresetRepository.findById = vi.fn().mockResolvedValue(mockAlgorithmPreset);
      mockSnapshotRepository.create = vi.fn().mockResolvedValue(mockSnapshot);

      const result = await service.create(createDto);

      expect(mockAlgorithmPresetRepository.findById).toHaveBeenCalledOnce();
      expect(mockAlgorithmPresetRepository.findById).toHaveBeenCalledWith(createDto.algorithmPresetId);
      expect(mockSnapshotRepository.create).toHaveBeenCalledOnce();

      // Verify that the preset is frozen and embedded as-is (no field stripping)
      const createCall = (mockSnapshotRepository.create as any).mock.calls[0][0];
      expect(createCall.algorithmPreset).toBe(createDto.algorithmPresetId);
      expect(createCall.algorithmPresetFrozen).toEqual(mockAlgorithmPreset);
      expect(result).toBe(mockSnapshot);
    });

    it('should derive deduped selected_assets from grouped selected_resources', async () => {
      vi.mocked(getAlgorithmDefinition).mockReturnValue(JSON.stringify(tokenValueOverTimeDefinition));
      mockStorageService.getObjectMetadata = vi.fn().mockResolvedValue({
        filename: 'wallets.json',
        ext: 'json',
        size: 512,
        contentType: 'application/json',
        timestamp: Date.now(),
      });
      mockStorageService.getObject = vi.fn().mockResolvedValue(
        Buffer.from(
          JSON.stringify({
            wallets: {
              ethereum: ['0x1234567890abcdef1234567890abcdef12345678'],
              cardano: ['addr1q9exampleexampleexampleexampleexampleexample'],
            },
          }),
          'utf-8',
        ),
      );

      const createDto: CreateSnapshotDto = {
        algorithmPresetId: '507f1f77bcf86cd799439011',
      };

      const mockAlgorithmPreset = {
        _id: '507f1f77bcf86cd799439011',
        key: 'token_value_over_time',
        version: '1.0.0',
        inputs: [
          { key: 'wallets', value: 'uploads/wallets.json' },
          {
            key: 'selected_resources',
            value: [
              {
                chain: 'ethereum',
                resource_key: 'fet_token',
              },
              {
                chain: 'ethereum',
                resource_key: 'fet_staking_1',
              },
              {
                chain: 'ethereum',
                resource_key: 'fet_staking_2',
              },
              {
                chain: 'cardano',
                resource_key: 'fet_token',
              },
            ],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAlgorithmPresetRepository.findById = vi.fn().mockResolvedValue(mockAlgorithmPreset);
      mockSnapshotRepository.create = vi.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439012',
        algorithmPreset: '507f1f77bcf86cd799439011',
        algorithmPresetFrozen: mockAlgorithmPreset,
        status: 'queued',
      });

      await service.create(createDto);

      const createCall = (mockSnapshotRepository.create as any).mock.calls[0][0];
      expect(createCall.algorithmPresetFrozen.inputs).toEqual([
        { key: 'wallets', value: 'uploads/wallets.json' },
        {
          key: 'selected_resources',
          value: [
            {
              chain: 'ethereum',
              resource_key: 'fet_token',
            },
            {
              chain: 'ethereum',
              resource_key: 'fet_staking_1',
            },
            {
              chain: 'ethereum',
              resource_key: 'fet_staking_2',
            },
            {
              chain: 'cardano',
              resource_key: 'fet_token',
            },
          ],
        },
        {
          key: 'selected_assets',
          value: [
            { chain: 'ethereum', asset_identifier: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85' },
            { chain: 'cardano', asset_identifier: 'e824c0011176f0926ad51f492bcc63ac6a03a589653520839dc7e3d9' },
          ],
        },
      ]);
    });

    it('should throw NotFoundException when algorithmPreset does not exist', async () => {
      const createDto: CreateSnapshotDto = {
        algorithmPresetId: '507f1f77bcf86cd799439011',
      };

      mockAlgorithmPresetRepository.findById = vi.fn().mockResolvedValue(null);

      const promise = service.create(createDto);

      await expect(promise).rejects.toBeInstanceOf(NotFoundException);
      await expect(promise).rejects.toThrow(/not found/i);
    });

    it('should pass optional temporal and outputs fields with frozen preset', async () => {
      const createDto: CreateSnapshotDto = {
        algorithmPresetId: '507f1f77bcf86cd799439011',
        temporal: { workflowId: 'wf-123', runId: 'run-456' },
        outputs: { csv: 'key' },
      };

      const mockAlgorithmPreset = {
        _id: '507f1f77bcf86cd799439011',
        key: 'test_key',
        version: '1.0.0',
        inputs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSnapshot = {
        _id: '507f1f77bcf86cd799439012',
        algorithmPreset: '507f1f77bcf86cd799439011',
        algorithmPresetFrozen: {
          key: 'test_key',
          version: '1.0.0',
          inputs: [],
        },
        temporal: { workflowId: 'wf-123', runId: 'run-456' },
        outputs: { csv: 'key' },
      };

      mockAlgorithmPresetRepository.findById = vi.fn().mockResolvedValue(mockAlgorithmPreset);
      mockSnapshotRepository.create = vi.fn().mockResolvedValue(mockSnapshot);

      const result = await service.create(createDto);

      const createCall = (mockSnapshotRepository.create as any).mock.calls[0][0];
      expect(createCall.temporal).toEqual({
        workflowId: 'wf-123',
        runId: 'run-456',
      });
      expect(createCall.outputs).toEqual({ csv: 'key' });
      expect(result).toBe(mockSnapshot);
    });

    it('should fail fast when a stored preset is stale against the current algorithm definition', async () => {
      const createDto: CreateSnapshotDto = {
        algorithmPresetId: '507f1f77bcf86cd799439011',
      };

      const stalePreset = {
        _id: '507f1f77bcf86cd799439011',
        key: 'token_value_over_time',
        version: '1.0.0',
        inputs: [{ key: 'selected_targets', value: [{ chain: 'ethereum', target_identifier: 'asset1' }] }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getAlgorithmDefinition).mockReturnValue(
        JSON.stringify({
          key: 'token_value_over_time',
          name: 'Token Value Over Time',
          category: 'Activity',
          summary: 'Test',
          description: 'Test algorithm',
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
      mockAlgorithmPresetRepository.findById = vi.fn().mockResolvedValue(stalePreset);

      await expect(service.create(createDto)).rejects.toThrow('Invalid algorithm inputs');
      expect(mockSnapshotRepository.create).not.toHaveBeenCalled();
      expect(mockTemporalService.startSnapshotWorkflow).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('should filter by status from queryDto', async () => {
      const queryDto: ListSnapshotsQueryDto = {
        status: 'queued',
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

      mockSnapshotRepository.findAll = vi.fn().mockResolvedValue(mockPaginatedResult);

      const result = await service.list(queryDto);

      expect(mockSnapshotRepository.findAll).toHaveBeenCalledOnce();
      const [filter, options] = (mockSnapshotRepository.findAll as any).mock.calls[0];
      expect(filter).toEqual({
        status: 'queued',
      });
      expect(options).toMatchObject({
        page: 1,
        limit: 10,
      });
      expect(result).toBe(mockPaginatedResult);
    });

    it('should filter by algorithmPreset from queryDto', async () => {
      const queryDto: ListSnapshotsQueryDto = {
        algorithmPreset: '507f1f77bcf86cd799439011',
        page: 1,
        limit: 10,
      };

      const mockPaginatedResult = {
        results: [],
        totalResults: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockSnapshotRepository.findAll = vi.fn().mockResolvedValue(mockPaginatedResult);

      const result = await service.list(queryDto);

      expect(mockSnapshotRepository.findAll).toHaveBeenCalledOnce();
      const [filter, options] = (mockSnapshotRepository.findAll as any).mock.calls[0];
      expect(filter).toEqual({
        algorithmPreset: '507f1f77bcf86cd799439011',
      });
      expect(options).toMatchObject({
        page: 1,
        limit: 10,
      });
      expect(result).toBe(mockPaginatedResult);
    });

    it('should filter by key directly on frozen field', async () => {
      const queryDto: ListSnapshotsQueryDto = {
        key: 'test_key',
        page: 1,
        limit: 10,
      };

      const mockPaginatedSnapshots = {
        results: [],
        totalResults: 5,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockSnapshotRepository.findAll = vi.fn().mockResolvedValue(mockPaginatedSnapshots);

      const result = await service.list(queryDto);

      expect(mockAlgorithmPresetRepository.findAll).not.toHaveBeenCalled();
      expect(mockSnapshotRepository.findAll).toHaveBeenCalledOnce();

      const [filter] = (mockSnapshotRepository.findAll as any).mock.calls[0];
      expect(filter['algorithmPresetFrozen.key']).toBe('test_key');
      expect(result).toBe(mockPaginatedSnapshots);
    });

    it('should filter by version directly on frozen field', async () => {
      const queryDto: ListSnapshotsQueryDto = {
        version: '1.0.0',
        page: 1,
        limit: 10,
      };

      const mockPaginatedSnapshots = {
        results: [],
        totalResults: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockSnapshotRepository.findAll = vi.fn().mockResolvedValue(mockPaginatedSnapshots);

      const result = await service.list(queryDto);

      expect(mockAlgorithmPresetRepository.findAll).not.toHaveBeenCalled();
      expect(mockSnapshotRepository.findAll).toHaveBeenCalledOnce();

      const [filter] = (mockSnapshotRepository.findAll as any).mock.calls[0];
      expect(filter['algorithmPresetFrozen.version']).toBe('1.0.0');
      expect(result).toBe(mockPaginatedSnapshots);
    });

    it('should filter by both key and version directly on frozen fields', async () => {
      const queryDto: ListSnapshotsQueryDto = {
        key: 'test_key',
        version: '1.0.0',
        page: 1,
        limit: 10,
      };

      const mockPaginatedSnapshots = {
        results: [],
        totalResults: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockSnapshotRepository.findAll = vi.fn().mockResolvedValue(mockPaginatedSnapshots);

      const result = await service.list(queryDto);

      expect(mockAlgorithmPresetRepository.findAll).not.toHaveBeenCalled();
      expect(mockSnapshotRepository.findAll).toHaveBeenCalledOnce();

      const [filter] = (mockSnapshotRepository.findAll as any).mock.calls[0];
      expect(filter['algorithmPresetFrozen.key']).toBe('test_key');
      expect(filter['algorithmPresetFrozen.version']).toBe('1.0.0');
      expect(result).toBe(mockPaginatedSnapshots);
    });

    it('should filter by algorithmPreset combined with status', async () => {
      const queryDto: ListSnapshotsQueryDto = {
        algorithmPreset: '507f1f77bcf86cd799439011',
        status: 'completed',
        page: 1,
        limit: 10,
      };

      const mockPaginatedResult = {
        results: [],
        totalResults: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockSnapshotRepository.findAll = vi.fn().mockResolvedValue(mockPaginatedResult);

      const result = await service.list(queryDto);

      expect(mockSnapshotRepository.findAll).toHaveBeenCalledOnce();
      const [filter] = (mockSnapshotRepository.findAll as any).mock.calls[0];
      expect(filter).toEqual({
        algorithmPreset: '507f1f77bcf86cd799439011',
        status: 'completed',
      });
      expect(result).toBe(mockPaginatedResult);
    });

    it('should handle empty query parameters without filters', async () => {
      const queryDto: ListSnapshotsQueryDto = {};

      const mockPaginatedResult = {
        results: [],
        totalResults: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockSnapshotRepository.findAll = vi.fn().mockResolvedValue(mockPaginatedResult);

      const result = await service.list(queryDto);

      expect(mockSnapshotRepository.findAll).toHaveBeenCalledOnce();
      expect(mockAlgorithmPresetRepository.findAll).not.toHaveBeenCalled();
      const [filter] = (mockSnapshotRepository.findAll as any).mock.calls[0];
      expect(filter).toEqual({});
      expect(result).toBe(mockPaginatedResult);
    });

    it('should handle populate option', async () => {
      const queryDto: ListSnapshotsQueryDto = {
        populate: 'algorithmPreset',
        page: 1,
        limit: 10,
      };

      const mockPaginatedResult = {
        results: [],
        totalResults: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockSnapshotRepository.findAll = vi.fn().mockResolvedValue(mockPaginatedResult);

      const result = await service.list(queryDto);

      const [, options] = (mockSnapshotRepository.findAll as any).mock.calls[0];
      expect(options).toMatchObject({
        page: 1,
        limit: 10,
        populate: 'algorithmPreset',
      });
      expect(result).toBe(mockPaginatedResult);
    });

    it('should handle sortBy passthrough when provided', async () => {
      const queryDto: ListSnapshotsQueryDto = {
        sortBy: 'createdAt:asc',
        page: 1,
        limit: 10,
      };

      const mockPaginatedResult = {
        results: [],
        totalResults: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockSnapshotRepository.findAll = vi.fn().mockResolvedValue(mockPaginatedResult);

      const result = await service.list(queryDto);

      const [, options] = (mockSnapshotRepository.findAll as any).mock.calls[0];
      expect(options).toMatchObject({
        sortBy: 'createdAt:asc',
      });
      expect(result).toBe(mockPaginatedResult);
    });

    it('should query directly for non-existent key on frozen field', async () => {
      const queryDto: ListSnapshotsQueryDto = {
        key: 'non_existent_key',
        page: 1,
        limit: 10,
      };

      const mockPaginatedSnapshots = {
        results: [],
        totalResults: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockSnapshotRepository.findAll = vi.fn().mockResolvedValue(mockPaginatedSnapshots);

      const result = await service.list(queryDto);

      expect(mockAlgorithmPresetRepository.findAll).not.toHaveBeenCalled();
      const [filter] = (mockSnapshotRepository.findAll as any).mock.calls[0];
      expect(filter['algorithmPresetFrozen.key']).toBe('non_existent_key');
      expect(result.totalResults).toBe(0);
      expect(result.results).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return snapshot when found', async () => {
      const id = '507f1f77bcf86cd799439011';
      const mockSnapshot = {
        _id: id,
        algorithmPreset: '507f1f77bcf86cd799439012',
        status: 'queued',
      };

      mockSnapshotRepository.findById = vi.fn().mockResolvedValue(mockSnapshot);

      const result = await service.getById(id);

      expect(mockSnapshotRepository.findById).toHaveBeenCalledOnce();
      expect(mockSnapshotRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toBe(mockSnapshot);
    });

    it('should throw NotFoundException when snapshot not found', async () => {
      const id = '507f1f77bcf86cd799439011';

      mockSnapshotRepository.findById = vi.fn().mockResolvedValue(null);

      const promise = service.getById(id);

      await expect(promise).rejects.toBeInstanceOf(NotFoundException);
      await expect(promise).rejects.toThrow(/not found/i);
    });
  });

  describe('deleteById', () => {
    it('should complete successfully when snapshot is deleted', async () => {
      const id = '507f1f77bcf86cd799439011';

      mockSnapshotRepository.findById = vi.fn().mockResolvedValue({
        _id: id,
        algorithmPresetFrozen: { inputs: [] },
      });
      mockSnapshotRepository.deleteById = vi.fn().mockResolvedValue({ _id: id });

      await service.deleteById(id);

      expect(mockSnapshotRepository.findById).toHaveBeenCalledWith(id);
      expect(mockSnapshotRepository.deleteById).toHaveBeenCalledOnce();
      expect(mockSnapshotRepository.deleteById).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when snapshot not found', async () => {
      const id = '507f1f77bcf86cd799439011';

      mockSnapshotRepository.findById = vi.fn().mockResolvedValue(null);

      const promise = service.deleteById(id);

      await expect(promise).rejects.toBeInstanceOf(NotFoundException);
      await expect(promise).rejects.toThrow(`${MODEL_NAMES.SNAPSHOT} with ID ${id} not found`);
    });

    it('should terminate workflow and clean S3 when snapshot is running', async () => {
      const id = '507f1f77bcf86cd799439011';
      const snapshot = {
        _id: id,
        status: 'running',
        temporal: { workflowId: 'wf-123' },
        algorithmPresetFrozen: {
          inputs: [{ key: 'votes', value: 'uploads/uuid-1/votes.csv' }],
        },
      };

      mockSnapshotRepository.findById = vi.fn().mockResolvedValue(snapshot);
      mockSnapshotRepository.deleteById = vi.fn().mockResolvedValue({ _id: id });
      mockStorageService.listObjectsByPrefix = vi
        .fn()
        .mockResolvedValue([
          'snapshots/507f1f77bcf86cd799439011/output1.csv',
          'snapshots/507f1f77bcf86cd799439011/output2.json',
        ]);
      mockStorageService.deleteObjects = vi.fn().mockResolvedValue({
        deleted: [
          'uploads/uuid-1/votes.csv',
          'snapshots/507f1f77bcf86cd799439011/output1.csv',
          'snapshots/507f1f77bcf86cd799439011/output2.json',
        ],
        errors: [],
      });

      await service.deleteById(id);

      // Verify workflow terminated
      expect(mockTemporalService.terminateSnapshotWorkflow).toHaveBeenCalledWith('wf-123', true);

      // Verify DB delete
      expect(mockSnapshotRepository.deleteById).toHaveBeenCalledWith(id);

      // Verify S3 cleanup
      expect(mockStorageService.listObjectsByPrefix).toHaveBeenCalledWith(`snapshots/${id}/`);
      expect(mockStorageService.deleteObjects).toHaveBeenCalledWith([
        'uploads/uuid-1/votes.csv',
        'snapshots/507f1f77bcf86cd799439011/output1.csv',
        'snapshots/507f1f77bcf86cd799439011/output2.json',
      ]);
    });

    it('should handle S3 cleanup failures gracefully', async () => {
      const id = '507f1f77bcf86cd799439011';
      const snapshot = {
        _id: id,
        status: 'completed',
        algorithmPresetFrozen: {
          inputs: [{ key: 'votes', value: 'uploads/uuid-1/votes.csv' }],
        },
      };

      mockSnapshotRepository.findById = vi.fn().mockResolvedValue(snapshot);
      mockSnapshotRepository.deleteById = vi.fn().mockResolvedValue({ _id: id });
      mockStorageService.listObjectsByPrefix = vi.fn().mockRejectedValue(new Error('S3 error'));

      // Should not throw even if S3 cleanup fails
      await expect(service.deleteById(id)).resolves.not.toThrow();

      // DB operations should still complete
      expect(mockSnapshotRepository.deleteById).toHaveBeenCalled();
    });

    it('should handle partial S3 deletion failures', async () => {
      const id = '507f1f77bcf86cd799439011';
      const snapshot = {
        _id: id,
        status: 'completed',
        algorithmPresetFrozen: {
          inputs: [{ key: 'votes', value: 'uploads/uuid-1/votes.csv' }],
        },
      };

      mockSnapshotRepository.findById = vi.fn().mockResolvedValue(snapshot);
      mockSnapshotRepository.deleteById = vi.fn().mockResolvedValue({ _id: id });
      mockStorageService.listObjectsByPrefix = vi
        .fn()
        .mockResolvedValue(['snapshots/507f1f77bcf86cd799439011/output.csv']);
      mockStorageService.deleteObjects = vi.fn().mockResolvedValue({
        deleted: ['uploads/uuid-1/votes.csv'],
        errors: [{ key: 'snapshots/507f1f77bcf86cd799439011/output.csv', message: 'Access denied' }],
      });

      await service.deleteById(id);

      // Should complete successfully despite partial S3 failure
      expect(mockSnapshotRepository.deleteById).toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
});
