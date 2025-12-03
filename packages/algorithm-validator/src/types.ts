/**
 * Core type definitions for algorithm validation.
 *
 * These types are used for validation on both client and server, ensuring
 * consistent type safety and validation rules across the entire application.
 *
 * Note: Algorithm definition types (AlgorithmDefinition, CsvIoItem, etc.) are
 * imported from @reputo/reputation-algorithms as the single source of truth.
 */

import type { AlgorithmDefinition, CsvIoItem } from '@reputo/reputation-algorithms';

/**
 * Re-export AlgorithmDefinition as the primary schema type.
 * This type represents the complete algorithm definition structure.
 */
export type { AlgorithmDefinition, CsvIoItem };

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
export interface CSVValidationResult {
  /** Whether the CSV is valid */
  valid: boolean;
  /** Array of error messages (empty if valid is true) */
  errors: string[];
}
