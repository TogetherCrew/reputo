import axios, { type AxiosError } from "axios"
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
} from "./types"

const API_BASE_PATH = "/api/v1"

// ── Centralised auth-failure handling ─────────────────────────────────

let authFailureHandled = false

/** Redirect to /login on session expiry. Guarded so only one redirect fires. */
export function handleAuthFailure(): void {
  if (authFailureHandled) return
  authFailureHandled = true
  window.location.href = "/login"
}

// Create axios instance with base configuration.
// Browser requests should always be same-origin (via Traefik / reverse-proxy).
const api = axios.create({
  baseURL: API_BASE_PATH,
  headers: {
    "Content-Type": "application/json",
  },
})

/** Axios interceptor — redirect to /login on any 401 response. */
function redirectToLoginOn401(error: AxiosError): Promise<never> {
  if (error.response?.status === 401) {
    handleAuthFailure()
  }
  return Promise.reject(error)
}

api.interceptors.response.use(undefined, redirectToLoginOn401)

// Algorithm Presets API
export const algorithmPresetsApi = {
  // Get all algorithm presets with pagination and filtering
  getAll: async (
    params?: AlgorithmPresetQueryParams
  ): Promise<PaginatedAlgorithmPresetResponseDto> => {
    const response = await api.get("/algorithm-presets", { params })
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
    const response = await api.post("/algorithm-presets", data)
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
    const response = await api.get("/snapshots", { params })
    return response.data
  },

  // Get a single snapshot by ID
  getById: async (id: string): Promise<SnapshotResponseDto> => {
    const response = await api.get(`/snapshots/${id}`)
    return response.data
  },

  // Create a new snapshot
  create: async (data: CreateSnapshotDto): Promise<SnapshotResponseDto> => {
    const response = await api.post("/snapshots", data)
    return response.data
  },

  // Delete a snapshot
  delete: async (id: string): Promise<void> => {
    await api.delete(`/snapshots/${id}`)
  },

  // Subscribe to snapshot events via SSE
  subscribeToEvents: (params?: { algorithmPreset?: string }): EventSource => {
    const url = new URL(
      `${API_BASE_PATH}/snapshots/events`,
      window.location.href
    )
    if (params?.algorithmPreset) {
      url.searchParams.set("algorithmPreset", params.algorithmPreset)
    }
    return new EventSource(url.toString())
  },
}

// Storage API
export const storageApi = {
  // Create presigned upload URL
  createUpload: async (data: {
    filename: string
    contentType: string
  }): Promise<{ key: string; url: string; expiresIn: number }> => {
    const response = await api.post("/storage/uploads", data)
    return response.data
  },
  createDownload: async (data: {
    key: string
  }): Promise<{ url: string; expiresIn: number }> => {
    const response = await api.post("/storage/downloads", data)
    return response.data
  },
  /** Same-origin stream URL (use downloadStream for auth-aware downloads). */
  getStreamUrl: (key: string): string => {
    return `${API_BASE_PATH}/storage/stream?key=${encodeURIComponent(key)}`
  },
  /** Auth-aware download. Redirects to /login on 401 instead of failing silently. */
  downloadStream: async (key: string, filename: string): Promise<void> => {
    const res = await fetch(
      `${API_BASE_PATH}/storage/stream?key=${encodeURIComponent(key)}`,
      { credentials: "include" }
    )
    if (res.status === 401) {
      handleAuthFailure()
      return
    }
    if (!res.ok) throw new Error(`Download failed: ${res.status}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },
  // Verify upload and get metadata
  verify: async (data: {
    key: string
  }): Promise<{
    key: string
    metadata: {
      filename: string
      ext: string
      size: number
      contentType: string
      timestamp: number
    }
  }> => {
    const response = await api.post("/storage/uploads/verify", data)
    return response.data
  },
}

export { api }
