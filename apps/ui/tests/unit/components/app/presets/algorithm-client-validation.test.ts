import { beforeEach, describe, expect, it, vi } from "vitest"

const { getStreamUrl } = vi.hoisted(() => ({
  getStreamUrl: vi.fn(),
}))

vi.mock("@/lib/api/services", () => ({
  storageApi: {
    getStreamUrl,
  },
}))

import { validateAlgorithmPresetClient } from "../../../../../src/components/app/presets/algorithm-client-validation"

describe("algorithm client validation", () => {
  beforeEach(() => {
    getStreamUrl.mockReset()
    getStreamUrl.mockReturnValue(
      "/api/v1/storage/stream?key=uploads%2Fwallets.json"
    )
    vi.stubGlobal("fetch", vi.fn())
  })

  it("rejects token_value_over_time when a selected chain has no wallets", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          wallets: {
            ethereum: ["0x68ab14C41040BF440A93CA6fb559D6E4AD82c25D"],
            cardano: [],
          },
        }),
    } as Response)

    await expect(
      validateAlgorithmPresetClient({
        key: "token_value_over_time",
        inputs: [
          {
            key: "wallets",
            value: "uploads/acd324f5-9ead-4b04-8ae2-7eeda5a1dea4/index.json",
          },
          {
            key: "selected_assets",
            value: [
              {
                chain: "cardano",
                asset_identifier:
                  "e824c0011176f0926ad51f492bcc63ac6a03a589653520839dc7e3d9",
              },
            ],
          },
        ],
      })
    ).resolves.toEqual([
      {
        field: "wallets",
        message:
          "Wallet JSON is missing wallet addresses for selected chain(s): cardano",
      },
    ])
  })

  it("passes token_value_over_time when selected chains have wallets", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          wallets: {
            ethereum: ["0x68ab14C41040BF440A93CA6fb559D6E4AD82c25D"],
            cardano: ["addr1q9exampleexampleexampleexampleexampleexample"],
          },
        }),
    } as Response)

    await expect(
      validateAlgorithmPresetClient({
        key: "token_value_over_time",
        inputs: [
          {
            key: "wallets",
            value: "uploads/acd324f5-9ead-4b04-8ae2-7eeda5a1dea4/index.json",
          },
          {
            key: "selected_assets",
            value: [
              {
                chain: "ethereum",
                asset_identifier: "0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85",
              },
              {
                chain: "cardano",
                asset_identifier:
                  "e824c0011176f0926ad51f492bcc63ac6a03a589653520839dc7e3d9",
              },
            ],
          },
        ],
      })
    ).resolves.toEqual([])
  })
})
