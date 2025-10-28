import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AlgorithmPresetController } from '../../../src/algorithm-preset/algorithm-preset.controller'
import { AlgorithmPresetService } from '../../../src/algorithm-preset/algorithm-preset.service'
import type {
    CreateAlgorithmPresetDto,
    ListAlgorithmPresetsQueryDto,
    UpdateAlgorithmPresetDto,
} from '../../../src/algorithm-preset/dto'


describe('AlgorithmPresetController', () => {
    let controller: AlgorithmPresetController
    let mockService: AlgorithmPresetService

    beforeEach(() => {
        vi.clearAllMocks()
        mockService = {
            create: vi.fn(),
            list: vi.fn(),
            getById: vi.fn(),
            updateById: vi.fn(),
            deleteById: vi.fn(),
        } as unknown as AlgorithmPresetService

        controller = new AlgorithmPresetController(mockService)
    })

    describe('create', () => {
        it('should delegate to service.create with the provided DTO', async () => {
            const createDto: CreateAlgorithmPresetDto = {
                key: 'test_key',
                version: '1.0.0',
                inputs: [{ key: 'input1', value: 'value1' }],
            }

            const mockPreset = { _id: '507f1f77bcf86cd799439011', ...createDto }
            mockService.create = vi.fn().mockResolvedValue(mockPreset)

            const result = await controller.create(createDto)

            expect(mockService.create).toHaveBeenCalledOnce()
            expect(mockService.create).toHaveBeenCalledWith(createDto)
            expect(result).toBe(mockPreset)
        })

        it('should pass optional fields from DTO to service', async () => {
            const createDto: CreateAlgorithmPresetDto = {
                key: 'test_key',
                version: '1.0.0',
                inputs: [{ key: 'input1', value: 'value1' }],
                name: 'Test Name',
                description: 'Test description with more than 10 chars',
            }

            const mockPreset = { _id: '507f1f77bcf86cd799439011', ...createDto }
            mockService.create = vi.fn().mockResolvedValue(mockPreset)

            await controller.create(createDto)

            expect(mockService.create).toHaveBeenCalledWith(createDto)
        })
    })

    describe('list', () => {
        it('should delegate to service.list with the provided query DTO', async () => {
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

            mockService.list = vi.fn().mockResolvedValue(mockPaginatedResult)

            const result = await controller.list(queryDto)

            expect(mockService.list).toHaveBeenCalledOnce()
            expect(mockService.list).toHaveBeenCalledWith(queryDto)
            expect(result).toBe(mockPaginatedResult)
        })

        it('should handle empty query parameters', async () => {
            const queryDto: ListAlgorithmPresetsQueryDto = {}

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
            const mockPreset = {
                _id: id,
                key: 'test_key',
                version: '1.0.0',
            }

            mockService.getById = vi.fn().mockResolvedValue(mockPreset)

            const result = await controller.getById(id)

            expect(mockService.getById).toHaveBeenCalledOnce()
            expect(mockService.getById).toHaveBeenCalledWith(id)
            expect(result).toBe(mockPreset)
        })
    })

    describe('updateById', () => {
        it('should delegate to service.updateById with id and update DTO', async () => {
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

            mockService.updateById = vi
                .fn()
                .mockResolvedValue(mockUpdatedPreset)

            const result = await controller.updateById(id, updateDto)

            expect(mockService.updateById).toHaveBeenCalledOnce()
            expect(mockService.updateById).toHaveBeenCalledWith(id, updateDto)
            expect(result).toBe(mockUpdatedPreset)
        })
    })

    describe('deleteById', () => {
        it('should delegate to service.deleteById with the provided id', async () => {
            const id = '507f1f77bcf86cd799439011'

            mockService.deleteById = vi.fn().mockResolvedValue(undefined)

            await controller.deleteById(id)

            expect(mockService.deleteById).toHaveBeenCalledOnce()
            expect(mockService.deleteById).toHaveBeenCalledWith(id)
        })
    })
})
