import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { MODEL_NAMES } from '@reputo/database'
import { AlgorithmPresetService } from '../../../src/algorithm-preset/algorithm-preset.service'
import { AlgorithmPresetRepository } from '../../../src/algorithm-preset/algorithm-preset.repository'
import type {
    CreateAlgorithmPresetDto,
    ListAlgorithmPresetsQueryDto,
    UpdateAlgorithmPresetDto,
} from '../../../src/algorithm-preset/dto'


describe('AlgorithmPresetService', () => {
    let service: AlgorithmPresetService
    let mockRepository: AlgorithmPresetRepository

    beforeEach(() => {
        vi.clearAllMocks()

        mockRepository = {
            create: vi.fn(),
            findAll: vi.fn(),
            findById: vi.fn(),
            updateById: vi.fn(),
            deleteById: vi.fn(),
        } as unknown as AlgorithmPresetRepository

        service = new AlgorithmPresetService(mockRepository)
    })

    describe('create', () => {
        it('should delegate to repository.create with the provided DTO', async () => {
            const createDto: CreateAlgorithmPresetDto = {
                key: 'test_key',
                version: '1.0.0',
                inputs: [{ key: 'input1', value: 'value1' }],
            }

            const mockPreset = { _id: '507f1f77bcf86cd799439011', ...createDto }
            mockRepository.create = vi.fn().mockResolvedValue(mockPreset)

            const result = await service.create(createDto)

            expect(mockRepository.create).toHaveBeenCalledOnce()
            expect(mockRepository.create).toHaveBeenCalledWith(createDto)
            expect(result).toBe(mockPreset)
        })
    })

    describe('list', () => {
        it('should filter by key and version from queryDto', async () => {
            const queryDto: ListAlgorithmPresetsQueryDto = {
                key: 'test_key',
                version: '1.0.0',
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

            mockRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedResult)

            const result = await service.list(queryDto)

            expect(mockRepository.findAll).toHaveBeenCalledOnce()
            const [filter, options] = (mockRepository.findAll as any).mock
                .calls[0]
            expect(filter).toEqual({ key: 'test_key', version: '1.0.0' })
            expect(options).toMatchObject({ page: 1, limit: 10 })
            expect(result).toBe(mockPaginatedResult)
        })

        it('should filter with pagination options including sortBy', async () => {
            const queryDto: ListAlgorithmPresetsQueryDto = {
                key: 'test_key',
                page: 2,
                limit: 20,
                sortBy: 'createdAt:desc',
            }

            const mockPaginatedResult = {
                results: [],
                totalResults: 50,
                page: 2,
                limit: 20,
                totalPages: 3,
            }

            mockRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedResult)

            const result = await service.list(queryDto)

            const [, options] = (mockRepository.findAll as any).mock.calls[0]
            expect(options).toMatchObject({
                page: 2,
                limit: 20,
                sortBy: 'createdAt:desc',
            })
            expect(result).toBe(mockPaginatedResult)
        })

        it('should handle empty queryDto with no filters', async () => {
            const queryDto: ListAlgorithmPresetsQueryDto = {}

            const mockPaginatedResult = {
                results: [],
                totalResults: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            }

            mockRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockPaginatedResult)

            const result = await service.list(queryDto)

            const [filter] = (mockRepository.findAll as any).mock.calls[0]
            expect(filter).toEqual({})
            expect(result).toBe(mockPaginatedResult)
        })
    })

    describe('getById', () => {
        it('should return preset when found', async () => {
            const id = '507f1f77bcf86cd799439011'
            const mockPreset = {
                _id: id,
                key: 'test_key',
                version: '1.0.0',
            }

            mockRepository.findById = vi.fn().mockResolvedValue(mockPreset)

            const result = await service.getById(id)

            expect(mockRepository.findById).toHaveBeenCalledOnce()
            expect(mockRepository.findById).toHaveBeenCalledWith(id)
            expect(result).toBe(mockPreset)
        })

        it('should throw NotFoundException when preset not found', async () => {
            const id = '507f1f77bcf86cd799439011'

            mockRepository.findById = vi.fn().mockResolvedValue(null)

            const promise = service.getById(id)

            await expect(promise).rejects.toBeInstanceOf(NotFoundException)
            await expect(promise).rejects.toThrow(
                `${MODEL_NAMES.ALGORITHM_PRESET} with ID ${id} not found`
            )
        })
    })

    describe('updateById', () => {
        it('should return updated preset when found', async () => {
            const id = '507f1f77bcf86cd799439011'
            const updateDto: UpdateAlgorithmPresetDto = {
                name: 'Updated Name',
                description: 'Updated description',
            }

            const mockUpdatedPreset = {
                _id: id,
                key: 'test_key',
                version: '1.0.0',
                ...updateDto,
            }

            mockRepository.updateById = vi
                .fn()
                .mockResolvedValue(mockUpdatedPreset)

            const result = await service.updateById(id, updateDto)

            expect(mockRepository.updateById).toHaveBeenCalledOnce()
            expect(mockRepository.updateById).toHaveBeenCalledWith(
                id,
                updateDto
            )
            expect(result).toBe(mockUpdatedPreset)
        })

        it('should throw NotFoundException when preset not found', async () => {
            const id = '507f1f77bcf86cd799439011'
            const updateDto: UpdateAlgorithmPresetDto = { name: 'Updated' }

            mockRepository.updateById = vi.fn().mockResolvedValue(null)

            const promise = service.updateById(id, updateDto)

            await expect(promise).rejects.toBeInstanceOf(NotFoundException)
            await expect(promise).rejects.toThrow(
                `${MODEL_NAMES.ALGORITHM_PRESET} with ID ${id} not found`
            )
        })
    })

    describe('deleteById', () => {
        it('should complete successfully when preset is deleted', async () => {
            const id = '507f1f77bcf86cd799439011'

            mockRepository.deleteById = vi.fn().mockResolvedValue({ _id: id })

            await service.deleteById(id)

            expect(mockRepository.deleteById).toHaveBeenCalledOnce()
            expect(mockRepository.deleteById).toHaveBeenCalledWith(id)
        })

        it('should throw NotFoundException when preset not found', async () => {
            const id = '507f1f77bcf86cd799439011'

            mockRepository.deleteById = vi.fn().mockResolvedValue(null)

            const promise = service.deleteById(id)

            await expect(promise).rejects.toBeInstanceOf(NotFoundException)
            await expect(promise).rejects.toThrow(
                `${MODEL_NAMES.ALGORITHM_PRESET} with ID ${id} not found`
            )
        })
    })
})
