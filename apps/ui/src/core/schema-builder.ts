/**
 * Schema builder utilities for generating form schemas from Algorithm objects
 */

import {
  type AlgorithmDefinition,
  getAlgorithmDefinition,
} from "@reputo/reputation-algorithms"
import type { Algorithm } from "./algorithms"

/**
 * Form input type for UI forms.
 * Extended from AlgorithmDefinition to support UI-specific form fields.
 */
export interface FormInput {
  key: string
  label: string
  type: string
  description?: string
  required?: boolean
  [key: string]: any // Allow additional properties for different input types
}

/**
 * Form schema for UI forms.
 * Based on AlgorithmDefinition but adapted for form generation.
 */
export interface FormSchema {
  key: string
  name: string
  category: string
  description: string
  version: string
  inputs: FormInput[]
  outputs: any[]
}

/**
 * Builds a form schema from an Algorithm object.
 * Includes name, description, key, version, and all algorithm inputs.
 */
export function buildSchemaFromAlgorithm(
  algorithm: Algorithm,
  version: string = "1.0.0"
): FormSchema {
  // Fetch full algorithm definition to get CSV config details
  let fullDefinition: AlgorithmDefinition | null = null
  try {
    const definitionJson = getAlgorithmDefinition({ key: algorithm.id })
    fullDefinition = JSON.parse(definitionJson) as AlgorithmDefinition
  } catch (error) {
    console.warn(`Could not fetch full definition for ${algorithm.id}:`, error)
  }

  // Transform algorithm inputs to form inputs
  const formInputs: FormInput[] = algorithm.inputs.map((algoInput) => {
    return transformInputToFormInput(algoInput, fullDefinition)
  })

  // Add metadata fields for preset creation
  const nameInput: FormInput = {
    key: "name",
    label: "Preset Name",
    type: "text",
    description: "Name for this algorithm preset",
    required: true,
    minLength: 3,
    maxLength: 100,
  }

  const descriptionInput: FormInput = {
    key: "description",
    label: "Description",
    type: "text",
    description: "Description of this algorithm preset",
    required: true,
    minLength: 10,
    maxLength: 500,
  }

  const keyInput: FormInput = {
    key: "key",
    label: "Algorithm Key",
    type: "text",
    description: "Algorithm identifier",
    required: true,
  }

  const versionInput: FormInput = {
    key: "version",
    label: "Version",
    type: "text",
    description: "Algorithm version",
    required: true,
  }

  // Build outputs from algorithm definition if available
  const outputs = fullDefinition?.outputs || []

  return {
    key: `preset_${algorithm.id}`,
    name: `Create Preset: ${algorithm.title}`,
    category: algorithm.category,
    description: algorithm.description,
    version,
    inputs: [
      keyInput,
      versionInput,
      nameInput,
      descriptionInput,
      ...formInputs,
    ],
    outputs,
  }
}

/**
 * Transforms an algorithm input to a form input
 */
function transformInputToFormInput(
  algoInput: { key: string; type: string; label: string },
  fullDefinition: AlgorithmDefinition | null
): FormInput {
  // Use the key from algoInput directly since we now pass it through
  const inputKey = algoInput.key

  // Try to find matching input in full definition for additional config
  const fullInput = fullDefinition?.inputs.find(
    (input) => input.key === inputKey || input.label === algoInput.label
  )

  // Helper to extract common numeric props from a numeric input
  const getNumericProps = () => {
    if (
      fullInput &&
      (fullInput.type === "number" || fullInput.type === "integer")
    ) {
      // Type assertion after narrowing - we know it's a NumericIoItem
      const numInput = fullInput as {
        min?: number
        max?: number
        step?: number
        default?: number
        required?: boolean
        uiHint?: { widget?: string }
        description?: string
      }
      return {
        min: numInput.min,
        max: numInput.max,
        step: numInput.step,
        default: numInput.default,
        required: numInput.required !== false,
        uiHint: numInput.uiHint,
        description: numInput.description,
      }
    }
    return { required: true }
  }

  switch (algoInput.type) {
    case "csv": {
      // Build CSV config from full definition or use defaults
      const csvConfig =
        fullInput?.type === "csv" && fullInput.csv
          ? {
              hasHeader: fullInput.csv.hasHeader ?? true,
              delimiter: fullInput.csv.delimiter ?? ",",
              maxRows: fullInput.csv.maxRows,
              maxBytes: fullInput.csv.maxBytes,
              columns: fullInput.csv.columns.map((col) => ({
                key: col.key,
                type: col.type === "integer" ? "number" : col.type,
                aliases: col.aliases,
                description: col.description,
                required: col.required !== false,
                enum: col.enum?.map((e) => String(e)),
              })),
            }
          : {
              hasHeader: true,
              delimiter: ",",
              columns: [],
            }

      return {
        key: inputKey,
        label: algoInput.label,
        type: "csv",
        csv: csvConfig,
        required: true,
      }
    }

    case "number":
    case "integer": {
      const numericProps = getNumericProps()

      // Check if this should be rendered as a slider
      if (numericProps.uiHint?.widget === "slider") {
        return {
          key: inputKey,
          label: algoInput.label,
          type: "slider",
          description: numericProps.description,
          min: numericProps.min,
          max: numericProps.max,
          step: numericProps.step,
          default: numericProps.default,
          required: numericProps.required,
        }
      }

      return {
        key: inputKey,
        label: algoInput.label,
        type: "number",
        description: numericProps.description,
        min: numericProps.min,
        max: numericProps.max,
        step: numericProps.step,
        default: numericProps.default,
        required: numericProps.required,
      }
    }

    case "boolean":
      return {
        key: inputKey,
        label: algoInput.label,
        type: "boolean",
        description: fullInput?.description,
        required:
          fullInput && "required" in fullInput
            ? fullInput.required !== false
            : true,
        default:
          fullInput && "default" in fullInput ? fullInput.default : false,
      }

    case "string":
      return {
        key: inputKey,
        label: algoInput.label,
        type: "text",
        description: fullInput?.description,
        required:
          fullInput && "required" in fullInput
            ? fullInput.required !== false
            : true,
      }

    default:
      // Default to text for unknown types
      return {
        key: inputKey,
        label: algoInput.label,
        type: "text",
        required: true,
      }
  }
}

/**
 * Re-export validation functions from the validator package
 */
export {
  buildZodSchema,
  type InferSchemaType,
  validateCSVContent,
} from "@reputo/algorithm-validator"
