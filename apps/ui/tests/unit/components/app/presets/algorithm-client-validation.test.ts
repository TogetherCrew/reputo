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
        version: "1.0.0",
        inputs: [
          {
            key: "wallets",
            value: "uploads/acd324f5-9ead-4b04-8ae2-7eeda5a1dea4/index.json",
          },
          {
            key: "maturation_threshold_days",
            value: 90,
          },
          {
            key: "selected_resources",
            value: [
              {
                chain: "cardano",
                resource_key: "fet_token",
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
        version: "1.0.0",
        inputs: [
          {
            key: "wallets",
            value: "uploads/acd324f5-9ead-4b04-8ae2-7eeda5a1dea4/index.json",
          },
          {
            key: "maturation_threshold_days",
            value: 90,
          },
          {
            key: "selected_resources",
            value: [
              {
                chain: "ethereum",
                resource_key: "fet_staking_1",
              },
              {
                chain: "cardano",
                resource_key: "fet_token",
              },
            ],
          },
        ],
      })
    ).resolves.toEqual([])
  })

  it("surfaces a recreate message for stale selected_targets presets", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          wallets: {
            ethereum: ["0x68ab14C41040BF440A93CA6fb559D6E4AD82c25D"],
          },
        }),
    } as Response)

    await expect(
      validateAlgorithmPresetClient({
        key: "token_value_over_time",
        version: "1.0.0",
        inputs: [
          {
            key: "wallets",
            value: "uploads/acd324f5-9ead-4b04-8ae2-7eeda5a1dea4/index.json",
          },
          {
            key: "maturation_threshold_days",
            value: 90,
          },
          {
            key: "selected_targets",
            value: [
              {
                chain: "ethereum",
                target_identifier: "0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85",
              },
            ],
          },
        ],
      })
    ).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "selected_targets",
          message: expect.stringContaining("Recreate the preset"),
        }),
        expect.objectContaining({
          field: "selected_resources",
        }),
      ])
    )
  })
})
