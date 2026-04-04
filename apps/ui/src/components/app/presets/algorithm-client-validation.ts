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
  const { url } = await storageApi.createDownload({ key: value })
  const response = await fetch(url)

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
  const fileContentCache = new Map<string, string>()
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
    resolveNestedDefinition: async ({ algorithmKey, algorithmVersion }) =>
      JSON.parse(
        getAlgorithmDefinition({ key: algorithmKey, version: algorithmVersion })
      ) as AlgorithmDefinition,
    resolveInputContent: async ({ value }) => {
      if (typeof value === "string" && value.trim() !== "") {
        const cached = fileContentCache.get(value)
        if (cached !== undefined) {
          return cached
        }

        const content = await readInputContent(value)
        fileContentCache.set(value, content)
        return content
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
