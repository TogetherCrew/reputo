/**
 * Type exports for algorithm validation.
 */

// Algorithm definition types (self-contained, no external dependencies)
export type {
  AlgorithmCategory,
  AlgorithmDefinition,
  AlgorithmRuntime,
  ArrayIoItem,
  CsvIoItem,
  IoItem,
  IoType,
  JsonIoItem,
  ObjectPropertyParam,
} from './algorithm.js';

/**
 * Result of payload validation against an AlgorithmDefinition.
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
export interface FileValidationResult {
  /** Whether the file content is valid */
  valid: boolean;
  /** Array of error messages (empty if valid is true) */
  errors: string[];
}

/**
 * Result of CSV content validation.
 */
export interface CSVValidationResult extends FileValidationResult {}

/**
 * Result of JSON content validation.
 */
export interface JSONValidationResult extends FileValidationResult {}
