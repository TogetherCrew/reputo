import axios from 'axios'
import type {
    AlgorithmPresetQueryParams,
    AlgorithmPresetResponseDto,
    CreateAlgorithmPresetDto,
    CreateSnapshotDto,
    PaginatedAlgorithmPresetResponseDto,
    PaginatedSnapshotResponseDto,
    SnapshotQueryParams,
    SnapshotResponseDto,
    UpdateAlgorithmPresetDto,
} from './types'

// Create axios instance with base configuration
const api = axios.create({
    baseURL:
        process.env.NEXT_PUBLIC_API_URL ||
        'https://api-staging.logid.xyz/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Algorithm Presets API
export const algorithmPresetsApi = {
    // Get all algorithm presets with pagination and filtering
    getAll: async (
        params?: AlgorithmPresetQueryParams
    ): Promise<PaginatedAlgorithmPresetResponseDto> => {
        const response = await api.get('/algorithm-presets', { params })
        return response.data
    },

    // Get a single algorithm preset by ID
    getById: async (id: string): Promise<AlgorithmPresetResponseDto> => {
        const response = await api.get(`/algorithm-presets/${id}`)
        return response.data
    },

    // Create a new algorithm preset
    create: async (
        data: CreateAlgorithmPresetDto
    ): Promise<AlgorithmPresetResponseDto> => {
        const response = await api.post('/algorithm-presets', data)
        return response.data
    },

    // Update an existing algorithm preset
    update: async (
        id: string,
        data: UpdateAlgorithmPresetDto
    ): Promise<AlgorithmPresetResponseDto> => {
        const response = await api.patch(`/algorithm-presets/${id}`, data)
        return response.data
    },

    // Delete an algorithm preset
    delete: async (id: string): Promise<void> => {
        await api.delete(`/algorithm-presets/${id}`)
    },
}

// Snapshots API
export const snapshotsApi = {
    // Get all snapshots with pagination and filtering
    getAll: async (
        params?: SnapshotQueryParams
    ): Promise<PaginatedSnapshotResponseDto> => {
        const response = await api.get('/snapshots', { params })
        return response.data
    },

    // Get a single snapshot by ID
    getById: async (id: string): Promise<SnapshotResponseDto> => {
        const response = await api.get(`/snapshots/${id}`)
        return response.data
    },

    // Create a new snapshot
    create: async (data: CreateSnapshotDto): Promise<SnapshotResponseDto> => {
        const response = await api.post('/snapshots', data)
        return response.data
    },

    // Delete a snapshot
    delete: async (id: string): Promise<void> => {
        await api.delete(`/snapshots/${id}`)
    },
}

// Export the axios instance for custom requests if needed
export { api }
