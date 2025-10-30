/**
 * Core exports for Reputo form builder and validation system
 */

// Types
export type {
  ReputoSchema,
  Input,
  TextInput,
  NumberInput,
  BooleanInput,
  DateInput,
  EnumInput,
  CSVInput,
  SliderInput,
  CSVConfig,
  ColumnDefinition,
  Output,
  ValidationResult,
} from "./types";

// Validation
export {
  buildZodSchema,
  validatePayload,
  validateCSVContent,
  type InferSchemaType,
} from "./validation";

// Client
export { reputoClient, ReputoClientClass } from "./client";

// Schema Builder
export { buildSchemaFromAlgorithm } from "./schema-builder";

// Form Component
export { ReputoForm } from "./reputo-form";

// Algorithms
export { algorithms, getAlgorithmById, type Algorithm } from "./algorithms";

// Field Components
export {
  TextField,
  NumberField,
  BooleanField,
  EnumField,
  SliderField,
  CSVField,
  DateField,
} from "./fields";

