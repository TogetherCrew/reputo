import type { AlgorithmDefinition } from "@reputo/reputation-algorithms"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Algorithm } from "../../../src/core/algorithms"
import { buildSchemaFromAlgorithm } from "../../../src/core/schema-builder"

const { mockGetAlgorithmDefinition } = vi.hoisted(() => ({
  mockGetAlgorithmDefinition: vi.fn(),
}))

vi.mock("@reputo/reputation-algorithms", () => ({
  getAlgorithmDefinition: mockGetAlgorithmDefinition,
}))

const algorithm: Algorithm = {
  id: "voting_engagement",
  title: "Voting Engagement",
  category: "Engagement",
  summary: "Scores voting diversity.",
  description: "Calculates voting engagement from a vote file.",
  duration: "~2-5 min",
  dependencies: "2 inputs",
  level: "Intermediate",
  inputs: [
    { key: "wallets", type: "json", label: "Wallet Addresses JSON" },
    { key: "votes_csv", type: "csv", label: "Votes CSV" },
    { key: "threshold", type: "number", label: "Threshold" },
    { key: "include_inactive", type: "boolean", label: "Include Inactive" },
    { key: "label", type: "string", label: "Display Label" },
  ],
  dataSourceLabels: [],
}

const definition: AlgorithmDefinition = {
  key: "voting_engagement",
  name: "Voting Engagement",
  category: "Engagement",
  summary: "Scores voting diversity.",
  description: "Calculates voting engagement from a vote file.",
  version: "1.0.0",
  inputs: [
    {
      key: "wallets",
      label: "Wallet Addresses JSON",
      type: "json",
      required: true,
      description: "Wallet addresses grouped by chain.",
      json: {
        maxBytes: 5242880,
        schema: "wallet_address_map",
        rootKey: "wallets",
        allowedChains: ["ethereum", "cardano"],
      },
    },
    {
      key: "votes_csv",
      label: "Votes CSV",
      type: "csv",
      csv: {
        hasHeader: true,
        delimiter: ";",
        maxRows: 1000,
        maxBytes: 2048,
        columns: [
          {
            key: "user_id",
            type: "integer",
            aliases: ["User ID"],
            required: true,
          },
        ],
      },
    },
    {
      key: "threshold",
      label: "Threshold",
      type: "number",
      min: 0,
      max: 10,
      step: 0.5,
      default: 3,
      uiHint: { widget: "slider" },
      description: "The minimum score threshold.",
    },
    {
      key: "include_inactive",
      label: "Include Inactive",
      type: "boolean",
      default: true,
      required: false,
      description: "Whether to include inactive voters.",
    },
    {
      key: "label",
      label: "Display Label",
      type: "string",
      required: false,
      description: "Custom label shown in exports.",
    },
  ],
  outputs: [
    { key: "scores", label: "Scores", type: "csv", csv: { columns: [] } },
  ],
  runtime: "typescript",
}

describe("buildSchemaFromAlgorithm", () => {
  beforeEach(() => {
    mockGetAlgorithmDefinition.mockReset()
  })

  it("builds metadata fields and maps rich algorithm definitions into form inputs", () => {
    mockGetAlgorithmDefinition.mockReturnValue(JSON.stringify(definition))

    const result = buildSchemaFromAlgorithm(algorithm, "2.0.0")

    expect(result.key).toBe("preset_voting_engagement")
    expect(result.version).toBe("2.0.0")
    expect(result.outputs).toEqual(definition.outputs)
    expect(result.inputs.slice(0, 4).map((input) => input.key)).toEqual([
      "key",
      "version",
      "name",
      "description",
    ])
    expect(result.inputs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "wallets",
          type: "json",
          description: "Wallet addresses grouped by chain.",
          required: true,
          json: {
            maxBytes: 5242880,
            schema: "wallet_address_map",
            rootKey: "wallets",
            allowedChains: ["ethereum", "cardano"],
          },
        }),
        expect.objectContaining({
          key: "votes_csv",
          type: "csv",
          csv: expect.objectContaining({
            delimiter: ";",
            maxRows: 1000,
            maxBytes: 2048,
            columns: [
              expect.objectContaining({
                key: "user_id",
                type: "number",
                aliases: ["User ID"],
              }),
            ],
          }),
        }),
        expect.objectContaining({
          key: "threshold",
          type: "slider",
          min: 0,
          max: 10,
          step: 0.5,
          default: 3,
          description: "The minimum score threshold.",
        }),
        expect.objectContaining({
          key: "include_inactive",
          type: "boolean",
          default: true,
          required: false,
        }),
        expect.objectContaining({
          key: "label",
          type: "text",
          description: "Custom label shown in exports.",
          required: false,
        }),
      ])
    )
  })

  it("falls back to defaults when the full definition cannot be loaded", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    mockGetAlgorithmDefinition.mockImplementation(() => {
      throw new Error("missing definition")
    })

    const result = buildSchemaFromAlgorithm(algorithm)

    expect(result.outputs).toEqual([])
    expect(result.inputs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "wallets",
          type: "json",
          required: true,
          json: undefined,
        }),
        expect.objectContaining({
          key: "votes_csv",
          type: "csv",
          csv: expect.objectContaining({
            hasHeader: true,
            delimiter: ",",
            columns: [],
          }),
        }),
        expect.objectContaining({
          key: "threshold",
          type: "number",
          required: true,
        }),
      ])
    )
    expect(warnSpy).toHaveBeenCalledWith(
      "Could not fetch full definition for voting_engagement:",
      expect.any(Error)
    )
  })
})
