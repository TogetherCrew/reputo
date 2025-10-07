import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { ValidationError } from '../errors/index.js';
import type { ValidationErrorDetail } from '../types/index.js';

/**
 * Default schema path relative to this module
 */
const DEFAULT_SCHEMA_PATH = '../schema/algorithm-definition.schema.json';

/**
 * Validator instance for algorithm definitions
 */
export class AlgorithmValidator {
  private readonly ajv: Ajv2020;
  private validateAlgorithm: ReturnType<Ajv2020['compile']> | null = null;

  constructor(schema?: Record<string, unknown>) {
    this.ajv = new Ajv2020({
      allErrors: true,
      verbose: true,
      strict: true,
      strictRequired: false,
      allowUnionTypes: true,
      validateFormats: true,
    });

    addFormats(this.ajv);

    if (schema) {
      this.loadSchema(schema);
    }
  }

  /**
   * Load algorithm definition schema
   */
  loadSchema(schema: Record<string, unknown>): void {
    this.ajv.addSchema(schema, 'algorithm-definition');
    this.validateAlgorithm = this.ajv.compile(schema);
  }

  /**
   * Validate an algorithm definition object
   * @param definition - Algorithm definition to validate
   * @returns Validation result with errors if any
   */
  validate(definition: unknown): {
    isValid: boolean;
    errors: ValidationErrorDetail[];
  } {
    if (!this.validateAlgorithm) {
      throw new Error('Schema not loaded. Call loadSchema() first.');
    }

    const isValid = this.validateAlgorithm(definition);

    if (isValid) {
      return { isValid: true, errors: [] };
    }

    const errors: ValidationErrorDetail[] = (this.validateAlgorithm.errors || []).map((e) => ({
      instancePath: e.instancePath,
      message: e.message || undefined,
      keyword: e.keyword,
      params: e.params || {},
    }));

    return { isValid: false, errors };
  }

  /**
   * Validate and throw on error (for easier error handling)
   * @param definition - Algorithm definition to validate
   * @param filePath - File path for error context
   * @throws ValidationError if validation fails
   */
  validateAndThrow(definition: unknown, filePath = 'runtime'): unknown {
    const result = this.validate(definition);

    if (!result.isValid) {
      const data = definition as Record<string, unknown>;
      throw new ValidationError(
        filePath,
        result.errors,
        data?.['key'] as string | undefined,
        data?.['version'] as string | undefined,
      );
    }

    return definition;
  }

  /**
   * Get the underlying Ajv instance for advanced usage
   */
  getAjv(): Ajv2020 {
    return this.ajv;
  }
}

/**
 * Load algorithm definition schema from file system
 */
function loadAlgorithmSchema(): Record<string, unknown> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const resolvedPath = join(__dirname, DEFAULT_SCHEMA_PATH);

  try {
    const schemaContent = readFileSync(resolvedPath, 'utf-8');
    return JSON.parse(schemaContent);
  } catch (error) {
    throw new Error(
      `Failed to load schema from ${resolvedPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Create validator with auto-loaded schema from default location
 */
export function createValidatorWithSchema(): AlgorithmValidator {
  const schema = loadAlgorithmSchema();
  return new AlgorithmValidator(schema);
}
