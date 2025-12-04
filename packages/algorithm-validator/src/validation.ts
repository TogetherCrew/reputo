/**
 * Core validation logic that runs identically on both client and server
 * This ensures consistency across the entire application
 */

import { z } from 'zod/v4';
import type { AlgorithmDefinition, CsvIoItem, ValidationResult } from './types/index.js';

/**
 * Validates data against an AlgorithmDefinition.
 *
 * This function runs identically on both client and server, ensuring consistent
 * validation across the entire application. It builds a Zod schema from the
 * AlgorithmDefinition and validates the payload against it.
 *
 * @param definition - The AlgorithmDefinition containing input/output specifications
 * @param payload - The data to validate against the definition
 * @returns A ValidationResult object containing either validated data or error details
 *
 * @example
 * ```typescript
 * const definition: AlgorithmDefinition = {
 *   key: 'voting_engagement',
 *   name: 'Voting Engagement',
 *   category: 'Engagement',
 *   description: 'Calculates engagement',
 *   version: '1.0.0',
 *   inputs: [
 *     {
 *       key: 'votes',
 *       label: 'Votes CSV',
 *       type: 'csv',
 *       csv: {
 *         hasHeader: true,
 *         delimiter: ',',
 *         columns: [
 *           { key: 'user_id', type: 'string', required: true }
 *         ]
 *       }
 *     }
 *   ],
 *   outputs: [],
 *   runtime: { taskQueue: 'default', activity: 'calculateVotingEngagement' }
 * }
 *
 * const result = validatePayload(definition, { votes: 'storage-key-123' })
 * if (result.success) {
 *   console.log('Valid:', result.data)
 * } else {
 *   console.error('Errors:', result.errors)
 * }
 * ```
 */
export function validatePayload(definition: AlgorithmDefinition, payload: unknown): ValidationResult {
  try {
    const zodSchema = buildZodSchema(definition);
    const result = zodSchema.safeParse(payload);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }
    return {
      success: false,
      errors: result.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      })),
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          field: '_schema',
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    };
  }
}

/**
 * Builds a Zod schema from an AlgorithmDefinition.
 *
 * This is the core validation logic that converts an AlgorithmDefinition into a Zod schema
 * that can be used for runtime validation. Each input in the definition is converted
 * to its corresponding Zod validator with appropriate constraints.
 *
 * @param definition - The AlgorithmDefinition to convert
 * @returns A Zod object schema that can be used for validation
 *
 * @example
 * ```typescript
 * const definition: AlgorithmDefinition = {
 *   // ... definition
 * }
 * const zodSchema = buildZodSchema(definition)
 * const result = zodSchema.safeParse(data)
 * ```
 */
export function buildZodSchema(definition: AlgorithmDefinition): z.ZodObject<Record<string, z.ZodType>> {
  const shape: Record<string, z.ZodType> = {};

  for (const input of definition.inputs) {
    shape[input.key] = buildFieldSchema(input);
  }

  return z.object(shape);
}

/**
 * Builds a Zod schema for a single input field based on its type.
 *
 * Currently supports CSV input types. The function handles optional fields
 * and applies type-specific validations based on the IoItem type.
 *
 * @param input - The input field definition from AlgorithmDefinition
 * @returns A Zod schema for the input field
 *
 * @internal
 */
function buildFieldSchema(input: CsvIoItem): z.ZodType {
  let schema: z.ZodType;

  // Handle CSV input type
  if (input.type === 'csv') {
    // For server validation, CSV is validated as a string (storage key)
    // Client-side uses File object validation
    const isBrowser =
      typeof globalThis !== 'undefined' && typeof (globalThis as { window?: unknown }).window !== 'undefined';

    if (!isBrowser) {
      // Server-side: validate as string (storage key)
      schema = z.string().min(1, `${input.label ?? input.key} is required`);
    } else {
      // Client-side: accept either a File (for local validation) OR a string storage key (after upload)
      schema = z.union([
        buildCSVSchema(input.csv, input.label ?? input.key),
        z.string().min(1, `${input.label ?? input.key} is required`),
      ]);
    }
  } else {
    // Default to string for other types (extensible for future IoItem types)
    schema = z.string();
  }

  return schema;
}

/**
 * Builds a Zod schema for CSV file validation (client-side only).
 *
 * Validates that the input is a File object, has the correct MIME type or extension,
 * and meets size constraints defined in the CSV configuration.
 *
 * @param csvConfig - CSV configuration containing validation constraints
 * @param label - Label for the input field (used in error messages)
 * @returns A Zod schema that validates File objects
 *
 * @internal
 */
function buildCSVSchema(csvConfig: CsvIoItem['csv'], label: string): z.ZodType {
  return z
    .instanceof(File, { message: `${label} must be a file` })
    .refine((file) => file.type === 'text/csv' || file.name.endsWith('.csv'), {
      message: `${label} must be a CSV file`,
    })
    .refine((file) => csvConfig.maxBytes === undefined || file.size <= csvConfig.maxBytes, {
      message: `${label} must be smaller than ${
        csvConfig.maxBytes !== undefined ? csvConfig.maxBytes / 1024 / 1024 : 0
      }MB`,
    });
}

/**
 * Type inference helper for AlgorithmDefinition.
 *
 * Infers the TypeScript type of the validated payload from an AlgorithmDefinition.
 * This allows you to get type-safe access to validated data.
 *
 * @example
 * ```typescript
 * const definition: AlgorithmDefinition = {
 *   // ... definition
 * }
 * type ValidatedType = InferSchemaType<typeof definition>
 * // ValidatedType will be the inferred type from the definition
 * ```
 */
export type InferSchemaType = z.infer<ReturnType<typeof buildZodSchema>>;
