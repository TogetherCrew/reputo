import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { MODEL_NAMES } from '@reputo/database'
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
            deleteById: vi.fn(),
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
        it('should create snapshot with frozen algorithmPreset when preset exists', async () => {
            const createDto: CreateSnapshotDto = {
                algorithmPresetId: '507f1f77bcf86cd799439011',
            }

            const mockAlgorithmPreset = {
                _id: '507f1f77bcf86cd799439011',
                key: 'test_key',
                version: '1.0.0',
                inputs: [{ key: 'param1', value: 'value1' }],
                name: 'Test Preset',
                description: 'Test description for preset',
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const mockSnapshot = {
                _id: '507f1f77bcf86cd799439012',
                algorithmPresetFrozen: {
                    key: 'test_key',
                    version: '1.0.0',
                    inputs: [{ key: 'param1', value: 'value1' }],
                    name: 'Test Preset',
                    description: 'Test description for preset',
                },
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
                createDto.algorithmPresetId
            )
            expect(mockSnapshotRepository.create).toHaveBeenCalledOnce()

            // Verify that the preset is frozen and embedded as-is (no field stripping)
            const createCall = (mockSnapshotRepository.create as any).mock
                .calls[0][0]
            expect(createCall.algorithmPresetFrozen).toEqual(
                mockAlgorithmPreset
            )
            expect(result).toBe(mockSnapshot)
        })

        it('should throw NotFoundException when algorithmPreset does not exist', async () => {
            const createDto: CreateSnapshotDto = {
                algorithmPresetId: '507f1f77bcf86cd799439011',
            }

            mockAlgorithmPresetRepository.findById = vi
                .fn()
                .mockResolvedValue(null)

            const promise = service.create(createDto)

            await expect(promise).rejects.toBeInstanceOf(NotFoundException)
            await expect(promise).rejects.toThrow(/not found/i)
        })

        it('should pass optional temporal and outputs fields with frozen preset', async () => {
            const createDto: CreateSnapshotDto = {
                algorithmPresetId: '507f1f77bcf86cd799439011',
                temporal: { workflowId: 'wf-123', runId: 'run-456' },
                outputs: { csv: 'key', json: 'key' },
            }

            const mockAlgorithmPreset = {
                _id: '507f1f77bcf86cd799439011',
                key: 'test_key',
                version: '1.0.0',
                inputs: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const mockSnapshot = {
                _id: '507f1f77bcf86cd799439012',
                algorithmPresetFrozen: {
                    key: 'test_key',
                    version: '1.0.0',
                    inputs: [],
                },
                temporal: { workflowId: 'wf-123', runId: 'run-456' },
                outputs: { csv: 'key', json: 'key' },
            }

            mockAlgorithmPresetRepository.findById = vi
                .fn()
                .mockResolvedValue(mockAlgorithmPreset)
            mockSnapshotRepository.create = vi
                .fn()
                .mockResolvedValue(mockSnapshot)

            const result = await service.create(createDto)

            const createCall = (mockSnapshotRepository.create as any).mock
                .calls[0][0]
            expect(createCall.temporal).toEqual({
                workflowId: 'wf-123',
                runId: 'run-456',
            })
            expect(createCall.outputs).toEqual({ csv: 'key', json: 'key' })
            expect(result).toBe(mockSnapshot)
        })
    })

    describe('list', () => {
        it('should filter by status from queryDto', async () => {
            const queryDto: ListSnapshotsQueryDto = {
                status: 'queued',
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
            })
            expect(options).toMatchObject({
                page: 1,
                limit: 10,
            })
            expect(result).toBe(mockPaginatedResult)
        })

        it('should filter by key directly on frozen field', async () => {
            const queryDto: ListSnapshotsQueryDto = {
                key: 'test_key',
                page: 1,
                limit: 10,
            }

            const mockPaginatedSnapshots = {
                results: [],
                totalResults: 5,
                page: 1,
                limit: 10,
                totalPages: 1,
            }

            mockSnapshotRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedSnapshots)

            const result = await service.list(queryDto)

            expect(mockAlgorithmPresetRepository.findAll).not.toHaveBeenCalled()
            expect(mockSnapshotRepository.findAll).toHaveBeenCalledOnce()

            const [filter] = (mockSnapshotRepository.findAll as any).mock
                .calls[0]
            expect(filter['algorithmPresetFrozen.key']).toBe('test_key')
            expect(result).toBe(mockPaginatedSnapshots)
        })

        it('should filter by version directly on frozen field', async () => {
            const queryDto: ListSnapshotsQueryDto = {
                version: '1.0.0',
                page: 1,
                limit: 10,
            }

            const mockPaginatedSnapshots = {
                results: [],
                totalResults: 3,
                page: 1,
                limit: 10,
                totalPages: 1,
            }

            mockSnapshotRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedSnapshots)

            const result = await service.list(queryDto)

            expect(mockAlgorithmPresetRepository.findAll).not.toHaveBeenCalled()
            expect(mockSnapshotRepository.findAll).toHaveBeenCalledOnce()

            const [filter] = (mockSnapshotRepository.findAll as any).mock
                .calls[0]
            expect(filter['algorithmPresetFrozen.version']).toBe('1.0.0')
            expect(result).toBe(mockPaginatedSnapshots)
        })

        it('should filter by both key and version directly on frozen fields', async () => {
            const queryDto: ListSnapshotsQueryDto = {
                key: 'test_key',
                version: '1.0.0',
                page: 1,
                limit: 10,
            }

            const mockPaginatedSnapshots = {
                results: [],
                totalResults: 2,
                page: 1,
                limit: 10,
                totalPages: 1,
            }

            mockSnapshotRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedSnapshots)

            const result = await service.list(queryDto)

            expect(mockAlgorithmPresetRepository.findAll).not.toHaveBeenCalled()
            expect(mockSnapshotRepository.findAll).toHaveBeenCalledOnce()

            const [filter] = (mockSnapshotRepository.findAll as any).mock
                .calls[0]
            expect(filter['algorithmPresetFrozen.key']).toBe('test_key')
            expect(filter['algorithmPresetFrozen.version']).toBe('1.0.0')
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

        it('should query directly for non-existent key on frozen field', async () => {
            const queryDto: ListSnapshotsQueryDto = {
                key: 'non_existent_key',
                page: 1,
                limit: 10,
            }

            const mockPaginatedSnapshots = {
                results: [],
                totalResults: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            }

            mockSnapshotRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedSnapshots)

            const result = await service.list(queryDto)

            expect(mockAlgorithmPresetRepository.findAll).not.toHaveBeenCalled()
            const [filter] = (mockSnapshotRepository.findAll as any).mock
                .calls[0]
            expect(filter['algorithmPresetFrozen.key']).toBe('non_existent_key')
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

    describe('deleteById', () => {
        it('should complete successfully when snapshot is deleted', async () => {
            const id = '507f1f77bcf86cd799439011'

            mockSnapshotRepository.deleteById = vi
                .fn()
                .mockResolvedValue({ _id: id })

            await service.deleteById(id)

            expect(mockSnapshotRepository.deleteById).toHaveBeenCalledOnce()
            expect(mockSnapshotRepository.deleteById).toHaveBeenCalledWith(id)
        })

        it('should throw NotFoundException when snapshot not found', async () => {
            const id = '507f1f77bcf86cd799439011'

            mockSnapshotRepository.deleteById = vi.fn().mockResolvedValue(null)

            const promise = service.deleteById(id)

            await expect(promise).rejects.toBeInstanceOf(NotFoundException)
            await expect(promise).rejects.toThrow(
                `${MODEL_NAMES.SNAPSHOT} with ID ${id} not found`
            )
        })
    })
})
