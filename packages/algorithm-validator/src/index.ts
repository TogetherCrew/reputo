/**
 * @reputo/algorithm-validator
 * Shared Zod-based validation library for the Reputo ecosystem
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
// Type exports
export type {
  BaseInput,
  BooleanInput,
  ColumnDefinition,
  ColumnType,
  CSVConfig,
  CSVInput,
  CSVValidationResult,
  DateInput,
  EnumInput,
  Input,
  InputType,
  NumberInput,
  Output,
  ReputoSchema,
  SliderInput,
  TextInput,
  ValidationResult,
} from './types.js';
// Validation exports
export {
  buildZodSchema,
  type InferSchemaType,
  validatePayload,
} from './validation.js';
