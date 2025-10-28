import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SnapshotController } from '../../../src/snapshot/snapshot.controller'
import { SnapshotService } from '../../../src/snapshot/snapshot.service'
import type {
    CreateSnapshotDto,
    ListSnapshotsQueryDto,
} from '../../../src/snapshot/dto'


describe('SnapshotController', () => {
    let controller: SnapshotController
    let mockService: SnapshotService

    beforeEach(() => {
        vi.clearAllMocks()

        mockService = {
            create: vi.fn(),
            list: vi.fn(),
            getById: vi.fn(),
        } as unknown as SnapshotService

        controller = new SnapshotController(mockService)
    })

    describe('create', () => {
        it('should delegate to service.create with the provided DTO', async () => {
            const createDto: CreateSnapshotDto = {
                algorithmPreset: '507f1f77bcf86cd799439011',
            }

            const mockSnapshot = {
                _id: '507f1f77bcf86cd799439012',
                ...createDto,
                status: 'queued',
            }

            mockService.create = vi.fn().mockResolvedValue(mockSnapshot)

            const result = await controller.create(createDto)

            expect(mockService.create).toHaveBeenCalledOnce()
            expect(mockService.create).toHaveBeenCalledWith(createDto)
            expect(result).toBe(mockSnapshot)
        })

        it('should pass optional temporal and outputs fields from DTO to service', async () => {
            const createDto: CreateSnapshotDto = {
                algorithmPreset: '507f1f77bcf86cd799439011',
                temporal: {
                    workflowId: 'wf-123',
                    runId: 'run-456',
                    taskQueue: 'algorithms',
                },
                outputs: { result: 'data' },
            }

            const mockSnapshot = {
                _id: '507f1f77bcf86cd799439012',
                ...createDto,
                status: 'queued',
            }

            mockService.create = vi.fn().mockResolvedValue(mockSnapshot)

            await controller.create(createDto)

            expect(mockService.create).toHaveBeenCalledWith(createDto)
        })
    })

    describe('list', () => {
        it('should delegate to service.list with the provided query DTO', async () => {
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

            mockService.list = vi.fn().mockResolvedValue(mockPaginatedResult)

            const result = await controller.list(queryDto)

            expect(mockService.list).toHaveBeenCalledOnce()
            expect(mockService.list).toHaveBeenCalledWith(queryDto)
            expect(result).toBe(mockPaginatedResult)
        })

        it('should handle query with key and version filters', async () => {
            const queryDto: ListSnapshotsQueryDto = {
                key: 'test_key',
                version: '1.0.0',
                page: 1,
                limit: 10,
            }

            const mockPaginatedResult = {
                results: [],
                totalResults: 5,
                page: 1,
                limit: 10,
                totalPages: 1,
            }

            mockService.list = vi.fn().mockResolvedValue(mockPaginatedResult)

            const result = await controller.list(queryDto)

            expect(result).toBe(mockPaginatedResult)
        })

        it('should handle query with populate option', async () => {
            const queryDto: ListSnapshotsQueryDto = {
                populate: 'algorithmPreset',
                page: 1,
                limit: 10,
            }

            const mockPaginatedResult = {
                results: [],
                totalResults: 3,
                page: 1,
                limit: 10,
                totalPages: 1,
            }

            mockService.list = vi.fn().mockResolvedValue(mockPaginatedResult)

            const result = await controller.list(queryDto)

            expect(result).toBe(mockPaginatedResult)
        })

        it('should handle empty query parameters', async () => {
            const queryDto: ListSnapshotsQueryDto = {}

            const mockPaginatedResult = {
                results: [],
                totalResults: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            }

            mockService.list = vi.fn().mockResolvedValue(mockPaginatedResult)

            const result = await controller.list(queryDto)

            expect(result).toBe(mockPaginatedResult)
        })
    })

    describe('getById', () => {
        it('should delegate to service.getById with the provided id', async () => {
            const id = '507f1f77bcf86cd799439011'
            const mockSnapshot = {
                _id: id,
                algorithmPreset: '507f1f77bcf86cd799439012',
                status: 'queued',
            }

            mockService.getById = vi.fn().mockResolvedValue(mockSnapshot)

            const result = await controller.getById(id)

            expect(mockService.getById).toHaveBeenCalledOnce()
            expect(mockService.getById).toHaveBeenCalledWith(id)
            expect(result).toBe(mockSnapshot)
        })
    })
})
