/**
 * Core type definitions for ReputoSchema.
 *
 * These types are used for validation on both client and server, ensuring
 * consistent type safety and validation rules across the entire application.
 */

/**
 * Supported column types for CSV validation.
 */
export type ColumnType = 'string' | 'number' | 'date' | 'enum' | 'boolean';

/**
 * Definition for a CSV column with validation rules.
 */
export interface ColumnDefinition {
  /** The primary key/name of the column */
  key: string;
  /** The data type of the column */
  type: ColumnType;
  /** Alternative names/aliases for the column (for flexible matching) */
  aliases?: string[];
  /** Human-readable description of the column */
  description?: string;
  /** Whether the column is required (default: true) */
  required?: boolean;
  /** Allowed values for enum-type columns */
  enum?: string[];
}

/**
 * Configuration for CSV validation.
 *
 * Defines the structure, constraints, and expected columns for CSV files.
 */
export interface CSVConfig {
  /** Whether the CSV file has a header row */
  hasHeader: boolean;
  /** The delimiter character used in the CSV (e.g., ',', ';', '\t') */
  delimiter: string;
  /** Maximum number of data rows allowed */
  maxRows?: number;
  /** Maximum file size in bytes */
  maxBytes?: number;
  /** Array of column definitions that must be present */
  columns: ColumnDefinition[];
}

/**
 * Supported input types for ReputoSchema inputs.
 */
export type InputType = 'text' | 'number' | 'boolean' | 'date' | 'enum' | 'csv' | 'slider';

/**
 * Base interface for all input types.
 *
 * All input types extend this interface with type-specific properties.
 */
export interface BaseInput {
  /** Unique key identifier for the input */
  key: string;
  /** Human-readable label for the input */
  label: string;
  /** Optional description of the input */
  description?: string;
  /** Whether the input is required (default: true) */
  required?: boolean;
}

/**
 * Text input with length and pattern validation.
 */
export interface TextInput extends BaseInput {
  type: 'text';
  /** Minimum character length */
  minLength?: number;
  /** Maximum character length */
  maxLength?: number;
  /** Regular expression pattern the text must match */
  pattern?: string;
}

/**
 * Numeric input with min/max constraints.
 */
export interface NumberInput extends BaseInput {
  type: 'number';
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
}

/**
 * Boolean input (true/false).
 */
export interface BooleanInput extends BaseInput {
  type: 'boolean';
}

/**
 * Date input with min/max date constraints.
 */
export interface DateInput extends BaseInput {
  type: 'date';
  /** Minimum allowed date (ISO string) */
  minDate?: string;
  /** Maximum allowed date (ISO string) */
  maxDate?: string;
}

/**
 * Enum input with predefined options.
 */
export interface EnumInput extends BaseInput {
  type: 'enum';
  /** Array of allowed values */
  enum: string[];
}

/**
 * CSV file input with column validation.
 */
export interface CSVInput extends BaseInput {
  type: 'csv';
  /** CSV validation configuration */
  csv: CSVConfig;
}

/**
 * Slider input for numeric ranges (typically used in UI components).
 */
export interface SliderInput extends BaseInput {
  type: 'slider';
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Step increment (optional) */
  step?: number;
}

/**
 * Union type of all supported input types.
 */
export type Input = TextInput | NumberInput | BooleanInput | DateInput | EnumInput | CSVInput | SliderInput;

/**
 * Definition for an algorithm output.
 */
export interface Output {
  /** Unique key identifier for the output */
  key: string;
  /** Human-readable label for the output */
  label: string;
  /** Type of the output (e.g., 'number', 'string', 'csv') */
  type: string;
  /** Optional entity type the output relates to */
  entity?: string;
  /** Optional description of the output */
  description?: string;
}

/**
 * Complete schema definition for a Reputo algorithm.
 *
 * This schema defines the structure, inputs, and outputs for an algorithm,
 * and is used to generate validation schemas and type definitions.
 */
export interface ReputoSchema {
  /** Unique key identifier for the algorithm */
  key: string;
  /** Human-readable name of the algorithm */
  name: string;
  /** Category the algorithm belongs to */
  category: string;
  /** Description of what the algorithm does */
  description: string;
  /** Version of the algorithm schema */
  version: string;
  /** Array of input definitions */
  inputs: Input[];
  /** Array of output definitions */
  outputs: Output[];
}

/**
 * Result of payload validation against a ReputoSchema.
 */
export interface ValidationResult {
  /** Whether validation succeeded */
  success: boolean;
  /** Validated data (only present if success is true) */
  data?: unknown;
  /** Array of validation errors (only present if success is false) */
  errors?: Array<{
    /** Field path where the error occurred */
    field: string;
    /** Human-readable error message */
    message: string;
    /** Zod error code (e.g., 'too_small', 'invalid_type') */
    code?: string;
  }>;
}

/**
 * Result of CSV content validation.
 */
export interface CSVValidationResult {
  /** Whether the CSV is valid */
  valid: boolean;
  /** Array of error messages (empty if valid is true) */
  errors: string[];
}
