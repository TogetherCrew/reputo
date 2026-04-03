import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { createDownload } = vi.hoisted(() => ({
  createDownload: vi.fn(),
}))

vi.mock("@/lib/api/services", () => ({
  storageApi: {
    createDownload,
  },
}))

import { downloadStorageFile } from "../../../../src/components/app/file-display"

describe("file display download helper", () => {
  beforeEach(() => {
    createDownload.mockReset()
    createDownload.mockResolvedValue({
      url: "https://storage.example/snapshots/details.json",
      expiresIn: 300,
      metadata: {
        filename: "details.json",
        ext: "json",
        size: 42,
        contentType: "application/json",
        timestamp: 1,
      },
    })
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("requests a presigned download, fetches the signed URL, and downloads the blob", async () => {
    const anchor = {
      click: vi.fn(),
      download: "",
      href: "",
      rel: "",
      remove: vi.fn(),
      style: { display: "" },
    }

    vi.stubGlobal("document", {
      body: {
        appendChild: vi.fn(),
      },
      createElement: vi.fn(() => anchor),
    })
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:details"),
      revokeObjectURL: vi.fn(),
    })
    vi.mocked(fetch).mockResolvedValue(
      new Response('{"ok":true}', { status: 200 })
    )

    await downloadStorageFile("snapshots/123/details.json")

    expect(createDownload).toHaveBeenCalledWith({
      key: "snapshots/123/details.json",
    })
    expect(fetch).toHaveBeenCalledWith(
      "https://storage.example/snapshots/details.json"
    )
    expect(document.createElement).toHaveBeenCalledWith("a")
    expect(anchor.href).toBe("blob:details")
    expect(anchor.download).toBe("details.json")
    expect(anchor.rel).toBe("noopener noreferrer")
    expect(anchor.style.display).toBe("none")
    expect(document.body.appendChild).toHaveBeenCalledWith(anchor)
    expect(anchor.click).toHaveBeenCalledOnce()
    expect(anchor.remove).toHaveBeenCalledOnce()
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:details")
  })
})
