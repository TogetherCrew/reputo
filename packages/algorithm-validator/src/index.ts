/**
 * @reputo/algorithm-validator
 *
 * Shared Zod-based validation library for the Reputo ecosystem.
 *
 * Provides schema building, payload validation, and CSV content validation
 * that runs identically on both client and server, ensuring consistent
 * validation across the entire application.
 *
 * Note: Algorithm definition types (AlgorithmDefinition, CsvIoItem, etc.) should
 * be imported directly from @reputo/reputation-algorithms.
 *
 * @packageDocumentation
 */

// CSV validation exports
export { validateCSVContent } from './csv-validation.js';
// Schema exports (for algorithm presets, etc.)
export {
  type AlgorithmPresetInputType,
  algorithmPresetInputSchema,
  type CreateAlgorithmPresetInput,
  createAlgorithmPresetSchema,
  validateCreateAlgorithmPreset,
} from './schemas/index.js';
// Type exports (validation result types only)
export type {
  CSVValidationResult,
  ValidationResult,
} from './types.js';
// Validation exports
export {
  buildZodSchema,
  type InferSchemaType,
  validatePayload,
} from './validation.js';
