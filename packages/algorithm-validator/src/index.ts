/**
 * @reputo/algorithm-validator
 *
 * Shared Zod-based validation library for the Reputo ecosystem.
 *
 * Provides schema building, payload validation, and CSV content validation
 * that runs identically on both client and server, ensuring consistent
 * validation across the entire application.
 *
 * Uses @reputo/reputation-algorithms as the source of truth for algorithm
 * definition types (AlgorithmDefinition, CsvIoItem, etc.).
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
// Type exports (re-exported from @reputo/reputation-algorithms)
export type {
  AlgorithmDefinition,
  CSVValidationResult,
  CsvIoItem,
  ValidationResult,
} from './types.js';
// Validation exports
export {
  buildZodSchema,
  type InferSchemaType,
  validatePayload,
} from './validation.js';
