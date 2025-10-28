import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { AlgorithmPresetModel } from '@reputo/database'
import { AlgorithmPresetRepository } from '../../../src/algorithm-preset/algorithm-preset.repository'
import type {
    CreateAlgorithmPresetDto,
    UpdateAlgorithmPresetDto,
} from '../../../src/algorithm-preset/dto'


describe('AlgorithmPresetRepository', () => {
    let repository: AlgorithmPresetRepository
    let mockModel: AlgorithmPresetModel

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
            findByIdAndUpdate: vi.fn().mockReturnValue({
                lean: vi.fn().mockReturnValue({
                    exec: vi.fn(),
                }),
            }),
            findByIdAndDelete: vi.fn().mockReturnValue({
                lean: vi.fn().mockReturnValue({
                    exec: vi.fn(),
                }),
            }),
        } as unknown as AlgorithmPresetModel

        repository = new AlgorithmPresetRepository(mockModel)
    })

    describe('create', () => {
        it('should call model.create with the provided DTO', async () => {
            const createDto: CreateAlgorithmPresetDto = {
                key: 'test_key',
                version: '1.0.0',
                inputs: [{ key: 'input1', value: 'value1' }],
            }

            const mockCreatedPreset = {
                _id: '507f1f77bcf86cd799439011',
                ...createDto,
            }
            mockModel.create = vi.fn().mockResolvedValue(mockCreatedPreset)

            const result = await repository.create(createDto)

            expect(mockModel.create).toHaveBeenCalledOnce()
            expect(mockModel.create).toHaveBeenCalledWith(createDto)
            expect(result).toBe(mockCreatedPreset)
        })

        it('should handle create errors', async () => {
            const createDto: CreateAlgorithmPresetDto = {
                key: 'test_key',
                version: '1.0.0',
                inputs: [],
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
            const filter = { key: 'test_key' }
            const options = { page: 1, limit: 10, sortBy: 'createdAt:desc' }

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
    })

    describe('findById', () => {
        it('should call model.findById with id and return lean result', async () => {
            const id = '507f1f77bcf86cd799439011'
            const mockPreset = {
                _id: id,
                key: 'test_key',
                version: '1.0.0',
            }

            const mockExec = vi.fn().mockResolvedValue(mockPreset)
            const mockLean = vi.fn().mockReturnValue({ exec: mockExec })
            mockModel.findById = vi.fn().mockReturnValue({ lean: mockLean })

            const result = await repository.findById(id)

            expect(mockModel.findById).toHaveBeenCalledOnce()
            expect(mockModel.findById).toHaveBeenCalledWith(id)
            expect(mockLean).toHaveBeenCalledOnce()
            expect(mockExec).toHaveBeenCalledOnce()
            expect(result).toBe(mockPreset)
        })

        it('should return null when preset not found', async () => {
            const id = '507f1f77bcf86cd799439011'

            const mockExec = vi.fn().mockResolvedValue(null)
            const mockLean = vi.fn().mockReturnValue({ exec: mockExec })
            mockModel.findById = vi.fn().mockReturnValue({ lean: mockLean })

            const result = await repository.findById(id)

            expect(result).toBeNull()
        })
    })

    describe('updateById', () => {
        it('should call model.findByIdAndUpdate with id and updateDto', async () => {
            const id = '507f1f77bcf86cd799439011'
            const updateDto: UpdateAlgorithmPresetDto = {
                name: 'Updated Name',
                description: 'Updated description',
            }

            const mockUpdatedPreset = { _id: id, ...updateDto }
            const mockExec = vi.fn().mockResolvedValue(mockUpdatedPreset)
            const mockLean = vi.fn().mockReturnValue({ exec: mockExec })
            mockModel.findByIdAndUpdate = vi
                .fn()
                .mockReturnValue({ lean: mockLean })

            const result = await repository.updateById(id, updateDto)

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledOnce()
            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
                id,
                updateDto,
                { new: true }
            )
            expect(result).toBe(mockUpdatedPreset)
        })

        it('should return null when preset not found', async () => {
            const id = '507f1f77bcf86cd799439011'
            const updateDto: UpdateAlgorithmPresetDto = { name: 'Updated' }

            const mockExec = vi.fn().mockResolvedValue(null)
            const mockLean = vi.fn().mockReturnValue({ exec: mockExec })
            mockModel.findByIdAndUpdate = vi
                .fn()
                .mockReturnValue({ lean: mockLean })

            const result = await repository.updateById(id, updateDto)

            expect(result).toBeNull()
        })
    })

    describe('deleteById', () => {
        it('should call model.findByIdAndDelete with id', async () => {
            const id = '507f1f77bcf86cd799439011'
            const mockDeletedPreset = { _id: id }

            const mockExec = vi.fn().mockResolvedValue(mockDeletedPreset)
            const mockLean = vi.fn().mockReturnValue({ exec: mockExec })
            mockModel.findByIdAndDelete = vi
                .fn()
                .mockReturnValue({ lean: mockLean })

            const result = await repository.deleteById(id)

            expect(mockModel.findByIdAndDelete).toHaveBeenCalledOnce()
            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id)
            expect(result).toBe(mockDeletedPreset)
        })

        it('should return null when preset not found', async () => {
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
