/**
 * Schema builder utilities for generating form schemas from Algorithm objects
 */

import { getAlgorithmDefinition, type AlgorithmDefinition } from '@reputo/reputation-algorithms'
import type { Algorithm } from './algorithms'

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
    version: string = '1.0.0'
): FormSchema {
    // Fetch full algorithm definition to get CSV config details
    let fullDefinition: AlgorithmDefinition | null = null
    try {
        const definitionJson = getAlgorithmDefinition({ key: algorithm.id })
        fullDefinition = JSON.parse(definitionJson) as AlgorithmDefinition
    } catch (error) {
        console.warn(
            `Could not fetch full definition for ${algorithm.id}:`,
            error
        )
    }

    // Transform algorithm inputs to form inputs
    const formInputs: FormInput[] = algorithm.inputs.map((algoInput) => {
        return transformInputToFormInput(algoInput, fullDefinition)
    })

    // Add metadata fields for preset creation
    const nameInput: FormInput = {
        key: 'name',
        label: 'Preset Name',
        type: 'text',
        description: 'Name for this algorithm preset',
        required: true,
        minLength: 3,
        maxLength: 100,
    }

    const descriptionInput: FormInput = {
        key: 'description',
        label: 'Description',
        type: 'text',
        description: 'Description of this algorithm preset',
        required: true,
        minLength: 10,
        maxLength: 500,
    }

    const keyInput: FormInput = {
        key: 'key',
        label: 'Algorithm Key',
        type: 'text',
        description: 'Algorithm identifier',
        required: true,
    }

    const versionInput: FormInput = {
        key: 'version',
        label: 'Version',
        type: 'text',
        description: 'Algorithm version',
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
    algoInput: { type: string; label: string },
    fullDefinition: AlgorithmDefinition | null
): FormInput {
    const inputKey = algoInput.label.toLowerCase().replace(/\s+/g, '_')

    // Try to find matching input in full definition for CSV config
    const fullInput = fullDefinition?.inputs.find(
        (input) => input.key === inputKey || input.label === algoInput.label
    )

    switch (algoInput.type) {
        case 'csv': {
            // Build CSV config from full definition or use defaults
            const csvConfig =
                fullInput?.type === 'csv' && fullInput.csv
                    ? {
                          hasHeader: fullInput.csv.hasHeader ?? true,
                          delimiter: fullInput.csv.delimiter ?? ',',
                          maxRows: fullInput.csv.maxRows,
                          maxBytes: fullInput.csv.maxBytes,
                          columns: fullInput.csv.columns.map((col) => ({
                              key: col.key,
                              type:
                                  col.type === 'integer' ? 'number' : col.type,
                              aliases: col.aliases,
                              description: col.description,
                              required: col.required !== false,
                              enum: col.enum?.map((e) => String(e)),
                          })),
                      }
                    : {
                          hasHeader: true,
                          delimiter: ',',
                          columns: [],
                      }

            return {
                key: inputKey,
                label: algoInput.label,
                type: 'csv',
                csv: csvConfig,
                required: true,
            }
        }

        case 'number':
            return {
                key: inputKey,
                label: algoInput.label,
                type: 'number',
                required: true,
            }

        case 'boolean':
            return {
                key: inputKey,
                label: algoInput.label,
                type: 'boolean',
                required: true,
            }

        case 'string':
            return {
                key: inputKey,
                label: algoInput.label,
                type: 'text',
                required: true,
            }

        default:
            // Default to text for unknown types
            return {
                key: inputKey,
                label: algoInput.label,
                type: 'text',
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
} from '@reputo/algorithm-validator'
