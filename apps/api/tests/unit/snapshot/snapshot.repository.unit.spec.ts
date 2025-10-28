import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { SnapshotModel } from '@reputo/database'
import { SnapshotRepository } from '../../../src/snapshot/snapshot.repository'
import type { CreateSnapshotDto } from '../../../src/snapshot/dto'

describe('SnapshotRepository', () => {
    let repository: SnapshotRepository
    let mockModel: SnapshotModel

    beforeEach(() => {
        vi.clearAllMocks()

        mockModel = {
            create: vi.fn(),
            paginate: vi.fn(),
            findById: vi.fn().mockReturnValue({
                lean: vi.fn().mockReturnValue({
                    exec: vi.fn(),
                }),
            }),
            findByIdAndDelete: vi.fn().mockReturnValue({
                lean: vi.fn().mockReturnValue({
                    exec: vi.fn(),
                }),
            }),
        } as unknown as SnapshotModel

        repository = new SnapshotRepository(mockModel)
    })

    describe('create', () => {
        it('should call model.create with the provided DTO', async () => {
            const createDto: CreateSnapshotDto = {
                algorithmPreset: '507f1f77bcf86cd799439011',
            }

            const mockCreatedSnapshot = {
                _id: '507f1f77bcf86cd799439012',
                ...createDto,
                status: 'queued',
            }
            mockModel.create = vi.fn().mockResolvedValue(mockCreatedSnapshot)

            const result = await repository.create(createDto)

            expect(mockModel.create).toHaveBeenCalledOnce()
            expect(mockModel.create).toHaveBeenCalledWith(createDto)
            expect(result).toBe(mockCreatedSnapshot)
        })

        it('should handle optional temporal and outputs fields', async () => {
            const createDto: CreateSnapshotDto = {
                algorithmPreset: '507f1f77bcf86cd799439011',
                temporal: {
                    workflowId: 'wf-123',
                    runId: 'run-456',
                    taskQueue: 'algorithms',
                },
                outputs: { result: 'data' },
            }

            const mockCreatedSnapshot = {
                _id: '507f1f77bcf86cd799439012',
                ...createDto,
                status: 'queued',
            }
            mockModel.create = vi.fn().mockResolvedValue(mockCreatedSnapshot)

            const result = await repository.create(createDto)

            expect(mockModel.create).toHaveBeenCalledWith(createDto)
            expect(result).toBe(mockCreatedSnapshot)
        })

        it('should handle create errors', async () => {
            const createDto: CreateSnapshotDto = {
                algorithmPreset: '507f1f77bcf86cd799439011',
            }

            const mockError = new Error('Database error')
            mockModel.create = vi.fn().mockRejectedValue(mockError)

            await expect(repository.create(createDto)).rejects.toThrow(
                'Database error'
            )
        })
    })

    describe('findAll', () => {
        it('should call model.paginate with filter and options', async () => {
            const filter = { status: 'queued' }
            const options = { page: 1, limit: 10, sortBy: 'createdAt:desc' }

            const mockPaginatedResult = {
                results: [],
                totalResults: 5,
                page: 1,
                limit: 10,
                totalPages: 1,
            }
            mockModel.paginate = vi.fn().mockResolvedValue(mockPaginatedResult)

            const result = await repository.findAll(filter, options)

            expect(mockModel.paginate).toHaveBeenCalledOnce()
            expect(mockModel.paginate).toHaveBeenCalledWith(filter, options)
            expect(result).toBe(mockPaginatedResult)
        })

        it('should handle empty filter and default pagination options', async () => {
            const filter = {}
            const options = {}

            const mockPaginatedResult = {
                results: [],
                totalResults: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            }
            mockModel.paginate = vi.fn().mockResolvedValue(mockPaginatedResult)

            const result = await repository.findAll(filter, options)

            expect(mockModel.paginate).toHaveBeenCalledOnce()
            expect(result).toBe(mockPaginatedResult)
        })

        it('should handle populate option', async () => {
            const filter = {}
            const options = { populate: 'algorithmPreset' }

            const mockPaginatedResult = {
                results: [],
                totalResults: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            }
            mockModel.paginate = vi.fn().mockResolvedValue(mockPaginatedResult)

            const result = await repository.findAll(filter, options)

            expect(mockModel.paginate).toHaveBeenCalledWith(filter, options)
            expect(result).toBe(mockPaginatedResult)
        })
    })

    describe('findById', () => {
        it('should call model.findById with id and return lean result', async () => {
            const id = '507f1f77bcf86cd799439011'
            const mockSnapshot = {
                _id: id,
                algorithmPreset: '507f1f77bcf86cd799439012',
                status: 'queued',
            }

            const mockExec = vi.fn().mockResolvedValue(mockSnapshot)
            const mockLean = vi.fn().mockReturnValue({ exec: mockExec })
            mockModel.findById = vi.fn().mockReturnValue({ lean: mockLean })

            const result = await repository.findById(id)

            expect(mockModel.findById).toHaveBeenCalledOnce()
            expect(mockModel.findById).toHaveBeenCalledWith(id)
            expect(mockLean).toHaveBeenCalledOnce()
            expect(mockExec).toHaveBeenCalledOnce()
            expect(result).toBe(mockSnapshot)
        })

        it('should return null when snapshot not found', async () => {
            const id = '507f1f77bcf86cd799439011'

            const mockExec = vi.fn().mockResolvedValue(null)
            const mockLean = vi.fn().mockReturnValue({ exec: mockExec })
            mockModel.findById = vi.fn().mockReturnValue({ lean: mockLean })

            const result = await repository.findById(id)

            expect(result).toBeNull()
        })
    })

    describe('deleteById', () => {
        it('should call model.findByIdAndDelete with id', async () => {
            const id = '507f1f77bcf86cd799439011'
            const mockDeletedSnapshot = { _id: id }

            const mockExec = vi.fn().mockResolvedValue(mockDeletedSnapshot)
            const mockLean = vi.fn().mockReturnValue({ exec: mockExec })
            mockModel.findByIdAndDelete = vi
                .fn()
                .mockReturnValue({ lean: mockLean })

            const result = await repository.deleteById(id)

            expect(mockModel.findByIdAndDelete).toHaveBeenCalledOnce()
            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id)
            expect(result).toBe(mockDeletedSnapshot)
        })

        it('should return null when snapshot not found', async () => {
            const id = '507f1f77bcf86cd799439011'

            const mockExec = vi.fn().mockResolvedValue(null)
            const mockLean = vi.fn().mockReturnValue({ exec: mockExec })
            mockModel.findByIdAndDelete = vi
                .fn()
                .mockReturnValue({ lean: mockLean })

            const result = await repository.deleteById(id)

            expect(result).toBeNull()
        })
    })
})
