"use client"

import { validateAlgorithmPreset } from "@reputo/algorithm-validator"
import {
  type AlgorithmDefinition,
  getAlgorithmDefinition,
} from "@reputo/reputation-algorithms"
import { storageApi } from "@/lib/api/services"
import type { InputDto } from "@/lib/api/types"

export interface ClientValidationError {
  field: string
  message: string
}

async function readInputContent(value: string): Promise<string> {
  const response = await fetch(storageApi.getStreamUrl(value), {
    credentials: "omit",
  })

  if (!response.ok) {
    throw new Error(`Unable to read uploaded file (${response.status})`)
  }

  return response.text()
}

export async function validateAlgorithmPresetClient(args: {
  key: string
  version: string
  inputs: ReadonlyArray<InputDto>
  name?: string
  description?: string
}): Promise<ClientValidationError[]> {
  const definition = JSON.parse(
    getAlgorithmDefinition({ key: args.key, version: args.version })
  ) as AlgorithmDefinition

  const result = await validateAlgorithmPreset({
    definition,
    preset: {
      key: args.key,
      version: args.version,
      inputs: args.inputs,
      name: args.name,
      description: args.description,
    },
    resolveInputContent: async ({ value }) => {
      if (typeof value === "string") {
        return readInputContent(value)
      }

      return value
    },
  })

  if (result.success) {
    return []
  }

  return (result.errors ?? []).map((error) => ({
    field: error.field,
    message: error.message,
  }))
}
