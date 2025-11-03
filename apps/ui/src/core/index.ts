/**
 * Core exports for Reputo form builder and validation system
 */


// Algorithms
export { type Algorithm, algorithms, getAlgorithmById } from "./algorithms";
// Client
export { ReputoClientClass, reputoClient } from "./client";
// Field Components
export {
  BooleanField,
  CSVField,
  DateField,
  EnumField,
  NumberField,
  SliderField,
  TextField,
} from "./fields";
// Form Component
export { ReputoForm } from "./reputo-form";
// Schema Builder
export { buildSchemaFromAlgorithm } from "./schema-builder";
// Types
export type {
  BooleanInput,
  ColumnDefinition,
  CSVConfig,
  CSVInput,
  DateInput,
  EnumInput,
  Input,
  NumberInput,
  Output,
  ReputoSchema,
  SliderInput,
  TextInput,
  ValidationResult,
} from "./types";
// Validation
export {
  buildZodSchema,
  type InferSchemaType,
  validateCSVContent,
  validatePayload,
} from "./validation";

