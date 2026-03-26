/**
 * Schema builder utilities for generating form schemas from Algorithm objects
 */

import {
  type AlgorithmDefinition,
  type ArrayIoItem,
  getAlgorithmDefinition,
  type JsonIoItem,
} from "@reputo/reputation-algorithms"
import type { Algorithm } from "./algorithms"

/** A preset that populates the entire array field with a fixed set of rows when applied. */
export interface ArrayPreset {
  label: string
  value: Array<Record<string, string>>
}

/** Value/label pair for select options. */
export interface SelectOption {
  value: string
  label: string
  /** When set, this option is shown only when the sibling `dependsOn` field equals this value. */
  filterBy?: string
}

/** Property definition for nested object fields inside a repeater. */
export interface FormInputProperty {
  key: string
  label: string
  type: string
  description?: string
  required?: boolean
  enum?: string[]
  default?: string | number
  options?: SelectOption[]
  dependsOn?: string
  filterBy?: string
}

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
  /** Suffix to display after the input (e.g. "days") */
  suffix?: string
  /** Preset quick-select values */
  presets?: number[]
  /** Min items for array fields */
  minItems?: number
  /** Add button label for repeater fields */
  addButtonLabel?: string
  /** Nested properties for array-of-object fields */
  itemProperties?: FormInputProperty[]
  /** Quick-fill presets for array fields */
  arrayPresets?: ArrayPreset[]
  /** JSON validation config */
  json?: {
    maxBytes?: number
    schema?: string
    rootKey?: string
    allowedChains?: string[]
  }
  /** Options for select/enum fields */
  options?: SelectOption[]
  /** Key of sibling field this depends on */
  dependsOn?: string
  [key: string]: any
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

  const getNumericProps = () => {
    if (
      fullInput &&
      (fullInput.type === "number" || fullInput.type === "integer")
    ) {
      const numInput = fullInput as {
        min?: number
        max?: number
        step?: number
        default?: number
        required?: boolean
        uiHint?: {
          widget?: string
          suffix?: string
          presets?: number[]
        }
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

    case "json": {
      const jsonConfig =
        fullInput?.type === "json"
          ? {
              maxBytes: (fullInput as JsonIoItem).json?.maxBytes,
              schema: (fullInput as JsonIoItem).json?.schema,
              rootKey: (fullInput as JsonIoItem).json?.rootKey,
              allowedChains: (fullInput as JsonIoItem).json?.allowedChains,
            }
          : undefined

      return {
        key: inputKey,
        label: algoInput.label,
        type: "json",
        description: fullInput?.description,
        json: jsonConfig,
        required:
          fullInput && "required" in fullInput
            ? fullInput.required !== false
            : true,
      }
    }

    case "number":
    case "integer": {
      const numericProps = getNumericProps()

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

      const numericType =
        (fullInput as { type?: string })?.type === "integer" ||
        algoInput.type === "integer"
          ? "integer"
          : "number"
      return {
        key: inputKey,
        label: algoInput.label,
        type: numericType,
        description: numericProps.description,
        min: numericProps.min,
        max: numericProps.max,
        step: numericProps.step,
        default: numericProps.default,
        required: numericProps.required,
        suffix: numericProps.uiHint?.suffix,
        presets: numericProps.uiHint?.presets,
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

    case "string": {
      const strInput = fullInput as {
        description?: string
        required?: boolean
        enum?: string[]
        uiHint?: {
          widget?: string
          options?: SelectOption[]
          dependsOn?: string
        }
      } | null

      if (strInput?.uiHint?.widget === "select" && strInput.uiHint.options) {
        return {
          key: inputKey,
          label: algoInput.label,
          type: "select",
          description: strInput.description,
          required: strInput.required !== false,
          options: strInput.uiHint.options,
          dependsOn: strInput.uiHint.dependsOn,
          enum: strInput.enum,
        }
      }

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
    }

    case "array": {
      const arrayInput = fullInput as ArrayIoItem | null
      const itemProps = arrayInput?.item?.properties ?? []

      return {
        key: inputKey,
        label: algoInput.label,
        type: "array",
        description: arrayInput?.description,
        required: arrayInput?.required !== false,
        minItems: arrayInput?.minItems,
        addButtonLabel: arrayInput?.uiHint?.addButtonLabel ?? "Add item",
        arrayPresets: arrayInput?.uiHint?.presets,
        itemProperties: itemProps.map((prop) => ({
          key: prop.key,
          label: prop.label ?? prop.key,
          type:
            prop.uiHint?.widget === "select" && prop.uiHint.options
              ? "select"
              : prop.type,
          description: prop.description,
          required: prop.required !== false,
          enum: prop.enum,
          default: prop.default,
          options: prop.uiHint?.options,
          dependsOn: prop.uiHint?.dependsOn,
        })),
      }
    }

    default:
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
  validateJSONContent,
} from "@reputo/algorithm-validator"
