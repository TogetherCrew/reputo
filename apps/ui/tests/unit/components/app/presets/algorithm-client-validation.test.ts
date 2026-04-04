import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { createDownload } = vi.hoisted(() => ({
  createDownload: vi.fn(),
}))

vi.mock("@/lib/api/services", () => ({
  storageApi: {
    createDownload,
  },
}))

import { validateAlgorithmPresetClient } from "../../../../../src/components/app/presets/algorithm-client-validation"

describe("algorithm client validation", () => {
  beforeEach(() => {
    createDownload.mockReset()
    createDownload.mockResolvedValue({
      url: "https://storage.example/uploads/sub_ids.json",
      expiresIn: 300,
      metadata: {
        filename: "sub_ids.json",
        ext: "json",
        size: 10,
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

  it("accepts token_value_over_time when selected chains have no uploaded wallets", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          "SubID-1": {
            userWallets: [
              {
                address: "0x68ab14C41040BF440A93CA6fb559D6E4AD82c25D",
                chain: "ethereum",
              },
            ],
          },
          "SubID-2": {},
        }),
    } as Response)

    await expect(
      validateAlgorithmPresetClient({
        key: "token_value_over_time",
        version: "1.0.0",
        inputs: [
          {
            key: "sub_ids",
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
    ).resolves.toEqual([])
  })

  it("passes token_value_over_time when selected chains have wallets", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          "SubID-1": {
            userWallets: [
              {
                address: "0x68ab14C41040BF440A93CA6fb559D6E4AD82c25D",
                chain: "ethereum",
              },
              {
                address: "addr1q9exampleexampleexampleexampleexampleexample",
                chain: "cardano",
              },
            ],
          },
        }),
    } as Response)

    await expect(
      validateAlgorithmPresetClient({
        key: "token_value_over_time",
        version: "1.0.0",
        inputs: [
          {
            key: "sub_ids",
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

  it("rejects old-format token_value_over_time wallet files", async () => {
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
            key: "sub_ids",
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
                resource_key: "fet_token",
              },
            ],
          },
        ],
      })
    ).resolves.toEqual([
      {
        field: "sub_ids",
        message:
          'Legacy top-level "wallets" JSON is not supported; provide SubID keys at the root',
      },
    ])
  })

  it("allows duplicate wallets across different sub-ids", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          "SubID-1": {
            userWallets: [
              {
                address: "0x68ab14C41040BF440A93CA6fb559D6E4AD82c25D",
                chain: "ethereum",
              },
            ],
          },
          "SubID-2": {
            userWallets: [
              {
                address: "0x68ab14c41040bf440a93ca6fb559d6e4ad82c25d",
                chain: "ethereum",
              },
            ],
          },
        }),
    } as Response)

    await expect(
      validateAlgorithmPresetClient({
        key: "token_value_over_time",
        version: "1.0.0",
        inputs: [
          {
            key: "sub_ids",
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
          "SubID-1": {
            userWallets: [
              {
                address: "0x68ab14C41040BF440A93CA6fb559D6E4AD82c25D",
                chain: "ethereum",
              },
            ],
          },
        }),
    } as Response)

    await expect(
      validateAlgorithmPresetClient({
        key: "token_value_over_time",
        version: "1.0.0",
        inputs: [
          {
            key: "sub_ids",
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

  it("reads uploaded files through the presigned download flow", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          "SubID-1": {
            userWallets: [
              {
                address: "0x68ab14C41040BF440A93CA6fb559D6E4AD82c25D",
                chain: "ethereum",
              },
            ],
          },
        }),
    } as Response)

    await validateAlgorithmPresetClient({
      key: "token_value_over_time",
      version: "1.0.0",
      inputs: [
        {
          key: "sub_ids",
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
              resource_key: "fet_token",
            },
          ],
        },
      ],
    })

    expect(createDownload).toHaveBeenCalledWith({
      key: "uploads/acd324f5-9ead-4b04-8ae2-7eeda5a1dea4/index.json",
    })
    expect(fetch).toHaveBeenCalledWith(
      "https://storage.example/uploads/sub_ids.json"
    )
  })

  it("surfaces signed-download fetch failures", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 403,
    } as Response)

    await expect(
      validateAlgorithmPresetClient({
        key: "token_value_over_time",
        version: "1.0.0",
        inputs: [
          {
            key: "sub_ids",
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
                resource_key: "fet_token",
              },
            ],
          },
        ],
      })
    ).resolves.toEqual([
      {
        field: "sub_ids",
        message: "Unable to read uploaded file (403)",
      },
    ])

    expect(createDownload).toHaveBeenCalledWith({
      key: "uploads/acd324f5-9ead-4b04-8ae2-7eeda5a1dea4/index.json",
    })
  })

  it("validates nested custom_algorithm child inputs through the shared validator", async () => {
    createDownload.mockImplementation(async ({ key }: { key: string }) => ({
      url: `https://storage.example/${key}`,
      expiresIn: 300,
      metadata: {
        filename: key.split("/").pop() ?? "file",
        ext: key.endsWith(".csv") ? "csv" : "json",
        size: 10,
        contentType: key.endsWith(".csv") ? "text/csv" : "application/json",
        timestamp: 1,
      },
    }))

    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input)

      if (url.endsWith("/uploads/root-sub-ids.json")) {
        return {
          ok: true,
          text: async () =>
            JSON.stringify({
              "SubID-1": {
                userWallets: [
                  {
                    address: "0x68ab14C41040BF440A93CA6fb559D6E4AD82c25D",
                    chain: "ethereum",
                  },
                ],
              },
            }),
        } as Response
      }

      if (url.endsWith("/uploads/votes.csv")) {
        return {
          ok: true,
          text: async () =>
            "id,event_id,answer,created_on,updated_on,question_id,balance,stake,collection_id,vote_id\n1,1,1,2024-01-01,2024-01-01,q1,1,1,c1,1\n",
        } as Response
      }

      throw new Error(`Unexpected fetch URL: ${url}`)
    })

    await expect(
      validateAlgorithmPresetClient({
        key: "custom_algorithm",
        version: "1.0.0",
        inputs: [
          {
            key: "sub_ids",
            value: "uploads/root-sub-ids.json",
          },
          {
            key: "sub_algorithms",
            value: [
              {
                algorithm_key: "voting_engagement",
                algorithm_version: "1.0.0",
                weight: 1,
                inputs: [
                  {
                    key: "votes",
                    value: "uploads/votes.csv",
                  },
                ],
              },
            ],
          },
          {
            key: "normalization_method",
            value: "none",
          },
          {
            key: "missing_score_strategy",
            value: "exclude",
          },
        ],
      })
    ).resolves.toEqual([])

    expect(createDownload).toHaveBeenCalledWith({
      key: "uploads/root-sub-ids.json",
    })
    expect(createDownload).toHaveBeenCalledWith({
      key: "uploads/votes.csv",
    })
  })
})
