export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

export interface ValidationErrorDetail {
  readonly instancePath: string;
  readonly message: string | undefined;
  readonly keyword: string;
  readonly params: Record<string, unknown>;
}
