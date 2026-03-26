"use client"

import { storageApi } from "@/lib/api/services"
import type { InputDto } from "@/lib/api/types"

export interface ClientValidationError {
  field: string
  message: string
}

type SupportedWalletChain = "ethereum" | "cardano"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getInputValue(
  inputs: ReadonlyArray<InputDto>,
  key: string
): unknown | undefined {
  return inputs.find((input) => input.key === key)?.value
}

async function readJsonFromStorage(storageKey: string): Promise<unknown> {
  const response = await fetch(storageApi.getStreamUrl(storageKey), {
    credentials: "omit",
  })

  if (!response.ok) {
    throw new Error(`Unable to read uploaded file (${response.status})`)
  }

  const text = await response.text()

  try {
    return JSON.parse(text)
  } catch {
    throw new Error("Uploaded wallet JSON is not valid JSON")
  }
}

async function validateTokenValueOverTimeWalletCoverage(
  inputs: ReadonlyArray<InputDto>
): Promise<ClientValidationError[]> {
  const walletsKey = getInputValue(inputs, "wallets")
  const selectedAssets = getInputValue(inputs, "selected_assets")

  if (typeof walletsKey !== "string" || walletsKey.trim() === "") {
    return []
  }

  if (!Array.isArray(selectedAssets) || selectedAssets.length === 0) {
    return []
  }

  const selectedChains = [
    ...new Set(
      selectedAssets
        .map((item) => (isRecord(item) ? item.chain : undefined))
        .filter(
          (chain): chain is SupportedWalletChain =>
            chain === "ethereum" || chain === "cardano"
        )
    ),
  ]

  if (selectedChains.length === 0) {
    return []
  }

  let walletsInput: unknown
  try {
    walletsInput = await readJsonFromStorage(walletsKey)
  } catch (error) {
    return [
      {
        field: "wallets",
        message:
          error instanceof Error
            ? error.message
            : "Unable to validate uploaded wallet JSON",
      },
    ]
  }

  if (!isRecord(walletsInput) || !isRecord(walletsInput.wallets)) {
    return [
      {
        field: "wallets",
        message: "Uploaded wallet JSON must contain a wallets object",
      },
    ]
  }

  const walletsByChain = walletsInput.wallets
  const missingChains = selectedChains.filter((chain) => {
    const wallets = walletsByChain[chain]
    return !Array.isArray(wallets) || wallets.length === 0
  })

  if (missingChains.length === 0) {
    return []
  }

  return [
    {
      field: "wallets",
      message: `Wallet JSON is missing wallet addresses for selected chain(s): ${missingChains.join(", ")}`,
    },
  ]
}

export async function validateAlgorithmPresetClient(args: {
  key: string
  inputs: ReadonlyArray<InputDto>
}): Promise<ClientValidationError[]> {
  if (args.key === "token_value_over_time") {
    return validateTokenValueOverTimeWalletCoverage(args.inputs)
  }

  return []
}
