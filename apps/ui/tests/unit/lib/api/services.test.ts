import { beforeEach, describe, expect, it, vi } from "vitest"

const { mockApi, mockCreate } = vi.hoisted(() => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }

  return {
    mockApi,
    mockCreate: vi.fn(() => mockApi),
  }
})

vi.mock("axios", () => ({
  default: {
    create: mockCreate,
  },
}))

import {
  algorithmPresetsApi,
  api,
  snapshotsApi,
  storageApi,
} from "../../../../src/lib/api/services"

describe("ui api services", () => {
  beforeEach(() => {
    mockApi.get.mockReset()
    mockApi.post.mockReset()
    mockApi.patch.mockReset()
    mockApi.delete.mockReset()

    ;(globalThis as { window?: unknown }).window = {
      location: { href: "https://reputo.local/dashboard" },
    }
    ;(globalThis as { EventSource?: unknown }).EventSource = vi
      .fn()
      .mockImplementation((url: string) => ({ url }))
  })

  it("creates the shared axios client with the expected base config", () => {
    expect(api).toBe(mockApi)
    expect(mockCreate).toHaveBeenCalledWith({
      baseURL: "/api/v1",
      headers: {
        "Content-Type": "application/json",
      },
    })
  })

  it("wraps algorithm preset endpoints", async () => {
    mockApi.get
      .mockResolvedValueOnce({ data: { results: [] } })
      .mockResolvedValueOnce({
        data: { _id: "preset-1" },
      })
    mockApi.post.mockResolvedValueOnce({ data: { _id: "preset-2" } })
    mockApi.patch.mockResolvedValueOnce({ data: { _id: "preset-3" } })
    mockApi.delete.mockResolvedValueOnce(undefined)

    await expect(
      algorithmPresetsApi.getAll({ key: "vote", limit: 10 })
    ).resolves.toEqual({ results: [] })
    await expect(algorithmPresetsApi.getById("preset-1")).resolves.toEqual({
      _id: "preset-1",
    })
    await expect(
      algorithmPresetsApi.create({
        key: "vote",
        version: "1.0.0",
        inputs: [],
      })
    ).resolves.toEqual({ _id: "preset-2" })
    await expect(
      algorithmPresetsApi.update("preset-1", { name: "Updated preset" })
    ).resolves.toEqual({ _id: "preset-3" })
    await expect(
      algorithmPresetsApi.delete("preset-1")
    ).resolves.toBeUndefined()

    expect(mockApi.get).toHaveBeenNthCalledWith(1, "/algorithm-presets", {
      params: { key: "vote", limit: 10 },
    })
    expect(mockApi.get).toHaveBeenNthCalledWith(
      2,
      "/algorithm-presets/preset-1"
    )
    expect(mockApi.post).toHaveBeenCalledWith("/algorithm-presets", {
      key: "vote",
      version: "1.0.0",
      inputs: [],
    })
    expect(mockApi.patch).toHaveBeenCalledWith("/algorithm-presets/preset-1", {
      name: "Updated preset",
    })
    expect(mockApi.delete).toHaveBeenCalledWith("/algorithm-presets/preset-1")
  })

  it("wraps snapshot endpoints and subscribes to filtered events", async () => {
    mockApi.get
      .mockResolvedValueOnce({ data: { results: [] } })
      .mockResolvedValueOnce({
        data: { _id: "snapshot-1" },
      })
    mockApi.post.mockResolvedValueOnce({ data: { _id: "snapshot-2" } })
    mockApi.delete.mockResolvedValueOnce(undefined)

    await expect(
      snapshotsApi.getAll({ status: "running", page: 2 })
    ).resolves.toEqual({ results: [] })
    await expect(snapshotsApi.getById("snapshot-1")).resolves.toEqual({
      _id: "snapshot-1",
    })
    await expect(
      snapshotsApi.create({ algorithmPresetId: "preset-1" })
    ).resolves.toEqual({ _id: "snapshot-2" })
    await expect(snapshotsApi.delete("snapshot-2")).resolves.toBeUndefined()

    const events = snapshotsApi.subscribeToEvents({
      algorithmPreset: "preset-1",
    }) as {
      url: string
    }

    expect(events.url).toBe(
      "https://reputo.local/api/v1/snapshots/events?algorithmPreset=preset-1"
    )
    expect(mockApi.get).toHaveBeenNthCalledWith(1, "/snapshots", {
      params: { status: "running", page: 2 },
    })
    expect(mockApi.get).toHaveBeenNthCalledWith(2, "/snapshots/snapshot-1")
    expect(mockApi.post).toHaveBeenCalledWith("/snapshots", {
      algorithmPresetId: "preset-1",
    })
    expect(mockApi.delete).toHaveBeenCalledWith("/snapshots/snapshot-2")
  })

  it("wraps storage endpoints and builds encoded stream URLs", async () => {
    mockApi.post
      .mockResolvedValueOnce({
        data: { key: "uploads/a.csv", url: "upload-url", expiresIn: 60 },
      })
      .mockResolvedValueOnce({ data: { url: "download-url", expiresIn: 60 } })
      .mockResolvedValueOnce({
        data: {
          key: "uploads/a.csv",
          metadata: {
            filename: "a.csv",
            ext: "csv",
            size: 10,
            contentType: "text/csv",
            timestamp: 1,
          },
        },
      })

    await expect(
      storageApi.createUpload({ filename: "a.csv", contentType: "text/csv" })
    ).resolves.toEqual({
      key: "uploads/a.csv",
      url: "upload-url",
      expiresIn: 60,
    })
    await expect(
      storageApi.createDownload({ key: "uploads/a.csv" })
    ).resolves.toEqual({
      url: "download-url",
      expiresIn: 60,
    })
    expect(storageApi.getStreamUrl("uploads/space file.csv")).toBe(
      "/api/v1/storage/stream?key=uploads%2Fspace%20file.csv"
    )
    await expect(storageApi.verify({ key: "uploads/a.csv" })).resolves.toEqual({
      key: "uploads/a.csv",
      metadata: {
        filename: "a.csv",
        ext: "csv",
        size: 10,
        contentType: "text/csv",
        timestamp: 1,
      },
    })
  })
})
