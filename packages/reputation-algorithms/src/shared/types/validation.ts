/**
 * Validation result interface for better error handling
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

/**
 * Validation error detail from Ajv
 */
export interface ValidationErrorDetail {
  readonly instancePath: string;
  readonly message: string | undefined;
  readonly keyword: string;
  readonly params: Record<string, unknown>;
}
