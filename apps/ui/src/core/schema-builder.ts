/**
 * Schema builder utilities for generating ReputoSchema from Algorithm objects
 */

import type { Algorithm } from "./algorithms";
import type { ReputoSchema, Input, CSVInput, CSVConfig, TextInput } from "./types";
import {
  getAlgorithmDefinition,
  type AlgorithmDefinition,
} from "@reputo/reputation-algorithms";

/**
 * Builds a ReputoSchema from an Algorithm object
 * Includes name, description, key, version, and all algorithm inputs
 */
export function buildSchemaFromAlgorithm(
  algorithm: Algorithm,
  version: string = "1.0.0"
): ReputoSchema {
  // Fetch full algorithm definition to get CSV config details
  let fullDefinition: AlgorithmDefinition | null = null;
  try {
    const definitionJson = getAlgorithmDefinition({ key: algorithm.id });
    fullDefinition = JSON.parse(definitionJson) as AlgorithmDefinition;
  } catch (error) {
    console.warn(`Could not fetch full definition for ${algorithm.id}:`, error);
  }

  // Transform algorithm inputs to ReputoSchema inputs
  const inputs: Input[] = algorithm.inputs.map((algoInput) => {
    return transformInputToReputoInput(algoInput, fullDefinition);
  });

  // Add name and description fields
  const nameInput: TextInput = {
    key: "name",
    label: "Preset Name",
    type: "text",
    description: "Name for this algorithm preset",
    required: true,
    minLength: 3,
    maxLength: 100,
  };

  const descriptionInput: TextInput = {
    key: "description",
    label: "Description",
    type: "text",
    description: "Description of this algorithm preset",
    required: true,
    minLength: 10,
    maxLength: 500,
  };

  // Add key and version as readonly text fields (for display/validation)
  const keyInput: TextInput = {
    key: "key",
    label: "Algorithm Key",
    type: "text",
    description: "Algorithm identifier",
    required: true,
  };

  const versionInput: TextInput = {
    key: "version",
    label: "Version",
    type: "text",
    description: "Algorithm version",
    required: true,
  };

  // Build outputs from algorithm definition if available
  const outputs = fullDefinition?.outputs.map((output) => ({
    key: output.key,
    label: output.label || output.key,
    type: output.type,
    entity: output.entity,
    description: output.description,
  })) || [];

  return {
    key: `preset_${algorithm.id}`,
    name: `Create Preset: ${algorithm.title}`,
    category: algorithm.category,
    description: algorithm.description,
    version,
    inputs: [keyInput, versionInput, nameInput, descriptionInput, ...inputs],
    outputs,
  };
}

/**
 * Transforms an algorithm input to a ReputoSchema input
 */
function transformInputToReputoInput(
  algoInput: { type: string; label: string },
  fullDefinition: AlgorithmDefinition | null
): Input {
  const inputKey = algoInput.label.toLowerCase().replace(/\s+/g, "_");

  // Try to find matching input in full definition for CSV config
  const fullInput = fullDefinition?.inputs.find(
    (input) => input.key === inputKey || input.label === algoInput.label
  );

  switch (algoInput.type) {
    case "csv": {
      // Build CSV config from full definition or use defaults
      const csvConfig: CSVConfig = fullInput?.type === "csv" && fullInput.csv
        ? {
            hasHeader: fullInput.csv.hasHeader ?? true,
            delimiter: fullInput.csv.delimiter ?? ",",
            maxRows: fullInput.csv.maxRows,
            maxBytes: fullInput.csv.maxBytes,
            columns: fullInput.csv.columns.map((col) => ({
              key: col.key,
              type: col.type === "integer" ? "number" : (col.type as any),
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
          };

      const csvInput: CSVInput = {
        key: inputKey,
        label: algoInput.label,
        type: "csv",
        csv: csvConfig,
        required: true,
      };
      return csvInput;
    }

    case "number":
      return {
        key: inputKey,
        label: algoInput.label,
        type: "number",
        required: true,
      };

    case "boolean":
      return {
        key: inputKey,
        label: algoInput.label,
        type: "boolean",
        required: true,
      };

    case "string":
      return {
        key: inputKey,
        label: algoInput.label,
        type: "text",
        required: true,
      };

    default:
      // Default to text for unknown types
      return {
        key: inputKey,
        label: algoInput.label,
        type: "text",
        required: true,
      };
  }
}

/**
 * Re-export validation functions from the core validation module
 */
export { buildZodSchema, validateCSVContent, type InferSchemaType } from "./validation";

