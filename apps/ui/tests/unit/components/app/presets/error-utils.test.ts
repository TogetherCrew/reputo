import { describe, expect, it } from "vitest"
import {
  extractApiErrorMessages,
  extractApiFieldErrors,
} from "../../../../../src/components/app/presets/error-utils"

describe("preset error utils", () => {
  it("extracts nested storage validation messages", () => {
    const error = {
      response: {
        data: {
          statusCode: 400,
          message: {
            message: "Storage input validation failed",
            errors: [
              {
                inputKey: "wallets",
                errors: [
                  "Wallet JSON is missing wallet addresses for selected chain(s): cardano",
                ],
              },
            ],
          },
        },
      },
    }

    expect(extractApiErrorMessages(error)).toEqual([
      "Wallet JSON is missing wallet addresses for selected chain(s): cardano",
    ])
    expect(extractApiFieldErrors(error)).toEqual([
      {
        field: "wallets",
        message:
          "Wallet JSON is missing wallet addresses for selected chain(s): cardano",
      },
    ])
  })

  it("falls back to the top-level message when no structured errors exist", () => {
    const error = {
      response: {
        data: {
          message: "Something failed",
        },
      },
    }

    expect(extractApiErrorMessages(error)).toEqual(["Something failed"])
    expect(extractApiFieldErrors(error)).toEqual([
      {
        field: "_general",
        message: "Something failed",
      },
    ])
  })
})
