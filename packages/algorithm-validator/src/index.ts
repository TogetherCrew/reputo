/**
 * @reputo/algorithm-validator
 *
 * Shared Zod-based validation library for the Reputo ecosystem.
 *
 * Provides schema building, payload validation, and CSV content validation
 * that runs identically on both client and server, ensuring consistent
 * validation across the entire application.
 *
 * This package is self-contained and has no dependencies on other Reputo
 * packages. Algorithm definition types are included for validation purposes.
 *
 * @packageDocumentation
 */

// CSV validation exports
export { validateCSVContent } from './csv-validation.js';
export { validateJSONContent } from './json-validation.js';
export {
  type ResolveInputContentArgs,
  type ValidateAlgorithmPresetArgs,
  validateAlgorithmPreset,
} from './preset-validation.js';
// Schema exports (for algorithm presets, etc.)
export {
  type AlgorithmPresetInputType,
  algorithmPresetInputSchema,
  type CreateAlgorithmPresetInput,
  createAlgorithmPresetSchema,
  validateCreateAlgorithmPreset,
} from './schemas/index.js';
// Algorithm definition type exports (self-contained)
// Type exports (validation result types)
export type {
  AlgorithmCategory,
  AlgorithmDefinition,
  AlgorithmPresetValidationResult,
  AlgorithmRuntime,
  AlgorithmValidationConfig,
  AlgorithmValidationRule,
  ArrayObjectPropertyParam,
  CSVValidationResult,
  CsvIoItem,
  IoItem,
  IoType,
  JSONValidationResult,
  JsonChainCoverageValidationRule,
  JsonIoItem,
  ResourceCatalog,
  ResourceCatalogChain,
  ResourceCatalogResource,
  ScalarObjectPropertyParam,
  ValidationResult,
} from './types/index.js';

// Validation exports
export {
  buildZodSchema,
  type InferSchemaType,
  validatePayload,
} from './validation.js';
