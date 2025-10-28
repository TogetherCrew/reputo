import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { SnapshotService } from '../../../src/snapshot/snapshot.service'
import { SnapshotRepository } from '../../../src/snapshot/snapshot.repository'
import { AlgorithmPresetRepository } from '../../../src/algorithm-preset/algorithm-preset.repository'
import type {
    CreateSnapshotDto,
    ListSnapshotsQueryDto,
} from '../../../src/snapshot/dto'

describe('SnapshotService', () => {
    let service: SnapshotService
    let mockSnapshotRepository: SnapshotRepository
    let mockAlgorithmPresetRepository: AlgorithmPresetRepository

    beforeEach(() => {
        vi.clearAllMocks()

        mockSnapshotRepository = {
            create: vi.fn(),
            findAll: vi.fn(),
            findById: vi.fn(),
        } as unknown as SnapshotRepository

        mockAlgorithmPresetRepository = {
            findById: vi.fn(),
            findAll: vi.fn(),
        } as unknown as AlgorithmPresetRepository

        service = new SnapshotService(
            mockSnapshotRepository,
            mockAlgorithmPresetRepository
        )
    })

    describe('create', () => {
        it('should create snapshot when algorithmPreset exists', async () => {
            const createDto: CreateSnapshotDto = {
                algorithmPreset: '507f1f77bcf86cd799439011',
            }

            const mockAlgorithmPreset = {
                _id: '507f1f77bcf86cd799439011',
                key: 'test_key',
                version: '1.0.0',
            }

            const mockSnapshot = {
                _id: '507f1f77bcf86cd799439012',
                ...createDto,
                status: 'queued',
            }

            mockAlgorithmPresetRepository.findById = vi
                .fn()
                .mockResolvedValue(mockAlgorithmPreset)
            mockSnapshotRepository.create = vi
                .fn()
                .mockResolvedValue(mockSnapshot)

            const result = await service.create(createDto)

            expect(
                mockAlgorithmPresetRepository.findById
            ).toHaveBeenCalledOnce()
            expect(mockAlgorithmPresetRepository.findById).toHaveBeenCalledWith(
                createDto.algorithmPreset
            )
            expect(mockSnapshotRepository.create).toHaveBeenCalledOnce()
            expect(mockSnapshotRepository.create).toHaveBeenCalledWith(
                createDto
            )
            expect(result).toBe(mockSnapshot)
        })

        it('should throw NotFoundException when algorithmPreset does not exist', async () => {
            const createDto: CreateSnapshotDto = {
                algorithmPreset: '507f1f77bcf86cd799439011',
            }

            mockAlgorithmPresetRepository.findById = vi
                .fn()
                .mockResolvedValue(null)

            const promise = service.create(createDto)

            await expect(promise).rejects.toBeInstanceOf(NotFoundException)
            await expect(promise).rejects.toThrow(/not found/i)
        })

        it('should pass optional temporal and outputs fields to repository', async () => {
            const createDto: CreateSnapshotDto = {
                algorithmPreset: '507f1f77bcf86cd799439011',
                temporal: { workflowId: 'wf-123', runId: 'run-456' },
                outputs: { result: 'data' },
            }

            const mockAlgorithmPreset = {
                _id: '507f1f77bcf86cd799439011',
                key: 'test_key',
                version: '1.0.0',
            }

            const mockSnapshot = {
                _id: '507f1f77bcf86cd799439012',
                ...createDto,
            }

            mockAlgorithmPresetRepository.findById = vi
                .fn()
                .mockResolvedValue(mockAlgorithmPreset)
            mockSnapshotRepository.create = vi
                .fn()
                .mockResolvedValue(mockSnapshot)

            const result = await service.create(createDto)

            expect(mockSnapshotRepository.create).toHaveBeenCalledWith(
                createDto
            )
            expect(result).toBe(mockSnapshot)
        })
    })

    describe('list', () => {
        it('should filter by status and algorithmPreset from queryDto', async () => {
            const queryDto: ListSnapshotsQueryDto = {
                status: 'queued',
                algorithmPreset: '507f1f77bcf86cd799439011',
                page: 1,
                limit: 10,
            }

            const mockPaginatedResult = {
                results: [],
                totalResults: 2,
                page: 1,
                limit: 10,
                totalPages: 1,
            }

            mockSnapshotRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedResult)

            const result = await service.list(queryDto)

            expect(mockSnapshotRepository.findAll).toHaveBeenCalledOnce()
            const [filter, options] = (mockSnapshotRepository.findAll as any)
                .mock.calls[0]
            expect(filter).toEqual({
                status: 'queued',
                algorithmPreset: '507f1f77bcf86cd799439011',
            })
            expect(options).toMatchObject({
                page: 1,
                limit: 10,
            })
            expect(result).toBe(mockPaginatedResult)
        })

        it('should filter by key through algorithmPreset lookup', async () => {
            const queryDto: ListSnapshotsQueryDto = {
                key: 'test_key',
                page: 1,
                limit: 10,
            }

            const mockAlgorithmPresets = [
                { _id: '507f1f77bcf86cd799439011', key: 'test_key' },
                { _id: '507f1f77bcf86cd799439012', key: 'test_key' },
            ]

            const mockPaginatedPresets = {
                results: mockAlgorithmPresets,
                totalResults: 2,
                page: 1,
                limit: 1000,
                totalPages: 1,
            }

            const mockPaginatedSnapshots = {
                results: [],
                totalResults: 5,
                page: 1,
                limit: 10,
                totalPages: 1,
            }

            mockAlgorithmPresetRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedPresets)
            mockSnapshotRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedSnapshots)

            const result = await service.list(queryDto)

            expect(mockAlgorithmPresetRepository.findAll).toHaveBeenCalledOnce()
            expect(mockSnapshotRepository.findAll).toHaveBeenCalledOnce()

            const [filter] = (mockSnapshotRepository.findAll as any).mock
                .calls[0]
            expect(filter.algorithmPreset).toEqual({
                $in: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
            })
            expect(result).toBe(mockPaginatedSnapshots)
        })

        it('should filter by version through algorithmPreset lookup', async () => {
            const queryDto: ListSnapshotsQueryDto = {
                version: '1.0.0',
                page: 1,
                limit: 10,
            }

            const mockAlgorithmPresets = [
                { _id: '507f1f77bcf86cd799439011', version: '1.0.0' },
            ]

            const mockPaginatedPresets = {
                results: mockAlgorithmPresets,
                totalResults: 1,
                page: 1,
                limit: 1000,
                totalPages: 1,
            }

            const mockPaginatedSnapshots = {
                results: [],
                totalResults: 3,
                page: 1,
                limit: 10,
                totalPages: 1,
            }

            mockAlgorithmPresetRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedPresets)
            mockSnapshotRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedSnapshots)

            const result = await service.list(queryDto)

            expect(mockAlgorithmPresetRepository.findAll).toHaveBeenCalledOnce()
            expect(result).toBe(mockPaginatedSnapshots)
        })

        it('should filter by both key and version', async () => {
            const queryDto: ListSnapshotsQueryDto = {
                key: 'test_key',
                version: '1.0.0',
                page: 1,
                limit: 10,
            }

            const mockAlgorithmPresets = [
                {
                    _id: '507f1f77bcf86cd799439011',
                    key: 'test_key',
                    version: '1.0.0',
                },
            ]

            const mockPaginatedPresets = {
                results: mockAlgorithmPresets,
                totalResults: 1,
                page: 1,
                limit: 1000,
                totalPages: 1,
            }

            const mockPaginatedSnapshots = {
                results: [],
                totalResults: 2,
                page: 1,
                limit: 10,
                totalPages: 1,
            }

            mockAlgorithmPresetRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedPresets)
            mockSnapshotRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedSnapshots)

            const result = await service.list(queryDto)

            expect(mockAlgorithmPresetRepository.findAll).toHaveBeenCalledOnce()
            const [, presetFilterOptions] = (
                mockAlgorithmPresetRepository.findAll as any
            ).mock.calls[0]
            expect(presetFilterOptions).toEqual({ page: 1, limit: 1000 })
            expect(result).toBe(mockPaginatedSnapshots)
        })

        it('should handle empty query parameters without filters', async () => {
            const queryDto: ListSnapshotsQueryDto = {}

            const mockPaginatedResult = {
                results: [],
                totalResults: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            }

            mockSnapshotRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedResult)

            const result = await service.list(queryDto)

            expect(mockSnapshotRepository.findAll).toHaveBeenCalledOnce()
            expect(mockAlgorithmPresetRepository.findAll).not.toHaveBeenCalled()
            const [filter] = (mockSnapshotRepository.findAll as any).mock
                .calls[0]
            expect(filter).toEqual({})
            expect(result).toBe(mockPaginatedResult)
        })

        it('should handle populate option', async () => {
            const queryDto: ListSnapshotsQueryDto = {
                populate: 'algorithmPreset',
                page: 1,
                limit: 10,
            }

            const mockPaginatedResult = {
                results: [],
                totalResults: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            }

            mockSnapshotRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedResult)

            const result = await service.list(queryDto)

            const [, options] = (mockSnapshotRepository.findAll as any).mock
                .calls[0]
            expect(options).toMatchObject({
                page: 1,
                limit: 10,
                populate: 'algorithmPreset',
            })
            expect(result).toBe(mockPaginatedResult)
        })

        it('should handle sortBy passthrough when provided', async () => {
            const queryDto: ListSnapshotsQueryDto = {
                sortBy: 'createdAt:asc',
                page: 1,
                limit: 10,
            }

            const mockPaginatedResult = {
                results: [],
                totalResults: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            }

            mockSnapshotRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedResult)

            const result = await service.list(queryDto)

            const [, options] = (mockSnapshotRepository.findAll as any).mock
                .calls[0]
            expect(options).toMatchObject({
                sortBy: 'createdAt:asc',
            })
            expect(result).toBe(mockPaginatedResult)
        })

        it('should handle empty algorithmPresets list from lookup with $in: []', async () => {
            const queryDto: ListSnapshotsQueryDto = {
                key: 'non_existent_key',
                page: 1,
                limit: 10,
            }

            const mockPaginatedPresets = {
                results: [],
                totalResults: 0,
                page: 1,
                limit: 1000,
                totalPages: 0,
            }

            const mockPaginatedSnapshots = {
                results: [],
                totalResults: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            }

            mockAlgorithmPresetRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedPresets)
            mockSnapshotRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedSnapshots)

            const result = await service.list(queryDto)

            const [filter] = (mockSnapshotRepository.findAll as any).mock
                .calls[0]
            expect(filter.algorithmPreset).toEqual({ $in: [] })
            expect(result.totalResults).toBe(0)
            expect(result.results).toEqual([])
        })
    })

    describe('getById', () => {
        it('should return snapshot when found', async () => {
            const id = '507f1f77bcf86cd799439011'
            const mockSnapshot = {
                _id: id,
                algorithmPreset: '507f1f77bcf86cd799439012',
                status: 'queued',
            }

            mockSnapshotRepository.findById = vi
                .fn()
                .mockResolvedValue(mockSnapshot)

            const result = await service.getById(id)

            expect(mockSnapshotRepository.findById).toHaveBeenCalledOnce()
            expect(mockSnapshotRepository.findById).toHaveBeenCalledWith(id)
            expect(result).toBe(mockSnapshot)
        })

        it('should throw NotFoundException when snapshot not found', async () => {
            const id = '507f1f77bcf86cd799439011'

            mockSnapshotRepository.findById = vi.fn().mockResolvedValue(null)

            const promise = service.getById(id)

            await expect(promise).rejects.toBeInstanceOf(NotFoundException)
            await expect(promise).rejects.toThrow(/not found/i)
        })
    })
})
