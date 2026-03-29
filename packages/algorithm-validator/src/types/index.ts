/**
 * Type exports for algorithm validation.
 */

// Algorithm definition types (self-contained, no external dependencies)
export type {
  AlgorithmCategory,
  AlgorithmDefinition,
  AlgorithmRuntime,
  AlgorithmValidationConfig,
  AlgorithmValidationRule,
  ArrayIoItem,
  ArrayObjectPropertyParam,
  CsvIoItem,
  IoItem,
  IoType,
  JsonChainCoverageValidationRule,
  JsonIoItem,
  ObjectPropertyParam,
  ResourceCatalog,
  ResourceCatalogChain,
  ResourceCatalogResource,
  ScalarObjectPropertyParam,
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

/**
 * Result of full algorithm preset validation against an AlgorithmDefinition.
 */
export interface AlgorithmPresetValidationResult {
  /** Whether validation succeeded */
  success: boolean;
  /** Validated preset envelope and payload when successful */
  data?: {
    preset: unknown;
    payload: Record<string, unknown>;
  };
  /** Validation errors grouped by source */
  errors?: Array<{
    /** Field path where the error occurred */
    field: string;
    /** Human-readable error message */
    message: string;
    /** Error source category */
    source: 'preset' | 'definition' | 'payload' | 'file' | 'rule';
    /** Optional validation code */
    code?: string;
  }>;
}
