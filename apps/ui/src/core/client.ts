/**
 * ReputoClient - Universal validation client
 * Validates payloads against schemas on both client and server
 */

import type { ReputoSchema, ValidationResult } from "./types";
import { validatePayload } from "./validation";

/**
 * Schema registry for storing known schemas
 */
class SchemaRegistry {
  private schemas: Map<string, ReputoSchema> = new Map();

  register(schema: ReputoSchema) {
    this.schemas.set(schema.key, schema);
  }

  get(key: string): ReputoSchema | undefined {
    return this.schemas.get(key);
  }

  has(key: string): boolean {
    return this.schemas.has(key);
  }

  getAll(): ReputoSchema[] {
    return Array.from(this.schemas.values());
  }
}

/**
 * ReputoClient - Main client for schema validation
 */
class ReputoClientClass {
  private registry = new SchemaRegistry();

  /**
   * Register a schema for validation
   */
  registerSchema(schema: ReputoSchema) {
    this.registry.register(schema);
    return this;
  }

  /**
   * Register multiple schemas
   */
  registerSchemas(schemas: ReputoSchema[]) {
    schemas.forEach((schema) => this.registry.register(schema));
    return this;
  }

  /**
   * Validate a payload against a registered schema
   * 
   * @param schemaKey - The key of the registered schema
   * @param payload - The data to validate
   * @returns ValidationResult with success status and errors if any
   * 
   * @example
   * ```typescript
   * const result = reputoClient.validate("voting_engagement", formData);
   * if (result.success) {
   *   console.log("Valid data:", result.data);
   * } else {
   *   console.error("Validation errors:", result.errors);
   * }
   * ```
   */
  validate(schemaKey: string, payload: any): ValidationResult {
    const schema = this.registry.get(schemaKey);

    if (!schema) {
      return {
        success: false,
        errors: [
          {
            field: "_schema",
            message: `Schema "${schemaKey}" not found. Please register it first.`,
          },
        ],
      };
    }

    return validatePayload(schema, payload);
  }

  /**
   * Validate a payload against a schema object directly
   */
  validateWithSchema(schema: ReputoSchema, payload: any): ValidationResult {
    return validatePayload(schema, payload);
  }

  /**
   * Get a registered schema by key
   */
  getSchema(key: string): ReputoSchema | undefined {
    return this.registry.get(key);
  }

  /**
   * Check if a schema is registered
   */
  hasSchema(key: string): boolean {
    return this.registry.has(key);
  }

  /**
   * Get all registered schemas
   */
  getAllSchemas(): ReputoSchema[] {
    return this.registry.getAll();
  }

  /**
   * Server-side validation endpoint
   * Call this from API routes
   */
  async validateFromRequest(
    schemaKey: string,
    request: Request
  ): Promise<ValidationResult> {
    try {
      const payload = await request.json();
      return this.validate(schemaKey, payload);
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            field: "_request",
            message: `Failed to parse request: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
        ],
      };
    }
  }
}

/**
 * Singleton instance of ReputoClient
 */
export const reputoClient = new ReputoClientClass();

/**
 * Export the class for custom instances if needed
 */
export { ReputoClientClass };

