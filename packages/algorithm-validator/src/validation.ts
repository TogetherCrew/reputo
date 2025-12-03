/**
 * Core validation logic that runs identically on both client and server
 * This ensures consistency across the entire application
 */

import { z } from 'zod/v4';
import type { CSVConfig, Input, ReputoSchema, ValidationResult } from './types.js';

/**
 * Validates data against a ReputoSchema definition.
 *
 * This function runs identically on both client and server, ensuring consistent
 * validation across the entire application. It builds a Zod schema from the
 * ReputoSchema and validates the payload against it.
 *
 * @param schema - The ReputoSchema definition containing input/output specifications
 * @param payload - The data to validate against the schema
 * @returns A ValidationResult object containing either validated data or error details
 *
 * @example
 * ```typescript
 * const schema: ReputoSchema = {
 *   key: 'voting_engagement',
 *   name: 'Voting Engagement',
 *   category: 'engagement',
 *   description: 'Calculates engagement',
 *   version: '1.0.0',
 *   inputs: [
 *     { key: 'threshold', label: 'Threshold', type: 'number', min: 0, max: 1, required: true }
 *   ],
 *   outputs: []
 * }
 *
 * const result = validatePayload(schema, { threshold: 0.5 })
 * if (result.success) {
 *   console.log('Valid:', result.data)
 * } else {
 *   console.error('Errors:', result.errors)
 * }
 * ```
 */
export function validatePayload(schema: ReputoSchema, payload: unknown): ValidationResult {
  try {
    const zodSchema = buildZodSchema(schema);
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
 * Builds a Zod schema from a ReputoSchema definition.
 *
 * This is the core validation logic that converts a ReputoSchema into a Zod schema
 * that can be used for runtime validation. Each input in the schema is converted
 * to its corresponding Zod validator with appropriate constraints.
 *
 * @param reputoSchema - The ReputoSchema definition to convert
 * @returns A Zod object schema that can be used for validation
 *
 * @example
 * ```typescript
 * const schema: ReputoSchema = {
 *   // ... schema definition
 * }
 * const zodSchema = buildZodSchema(schema)
 * const result = zodSchema.safeParse(data)
 * ```
 */
export function buildZodSchema(reputoSchema: ReputoSchema): z.ZodObject<Record<string, z.ZodType>> {
  const shape: Record<string, z.ZodType> = {};

  for (const input of reputoSchema.inputs) {
    shape[input.key] = buildFieldSchema(input);
  }

  return z.object(shape);
}

/**
 * Builds a Zod schema for a single input field based on its type.
 *
 * Each input type (text, number, boolean, date, enum, csv, slider) has specific
 * validation rules and constraints that are applied to the resulting Zod schema.
 * The function handles optional fields and applies type-specific validations.
 *
 * @param input - The input field definition from ReputoSchema
 * @returns A Zod schema for the input field
 *
 * @internal
 */
function buildFieldSchema(input: Input): z.ZodType {
  let schema: z.ZodType;

  switch (input.type) {
    case 'text': {
      let textSchema = z.string();
      if (input.minLength !== undefined) {
        textSchema = textSchema.min(input.minLength, `${input.label} must be at least ${input.minLength} characters`);
      }
      if (input.maxLength !== undefined) {
        textSchema = textSchema.max(input.maxLength, `${input.label} must be at most ${input.maxLength} characters`);
      }
      if (input.pattern !== undefined) {
        textSchema = textSchema.regex(new RegExp(input.pattern), `${input.label} must match the required pattern`);
      }
      schema = textSchema;
      break;
    }

    case 'number': {
      let numberSchema = z.number();
      if (input.min !== undefined) {
        numberSchema = numberSchema.min(input.min, `${input.label} must be at least ${input.min}`);
      }
      if (input.max !== undefined) {
        numberSchema = numberSchema.max(input.max, `${input.label} must be at most ${input.max}`);
      }
      schema = numberSchema;
      break;
    }

    case 'boolean':
      schema = z.boolean();
      break;

    case 'date': {
      let dateSchema: z.ZodType = z
        .string()
        .refine((val) => !Number.isNaN(Date.parse(val)), `${input.label} must be a valid date`);
      if (input.minDate !== undefined) {
        const minDate = new Date(input.minDate);
        dateSchema = (dateSchema as z.ZodString).refine(
          (val) => new Date(val) >= minDate,
          `${input.label} must be after ${input.minDate}`,
        );
      }
      if (input.maxDate !== undefined) {
        const maxDate = new Date(input.maxDate);
        dateSchema = (dateSchema as z.ZodString).refine(
          (val) => new Date(val) <= maxDate,
          `${input.label} must be before ${input.maxDate}`,
        );
      }
      schema = dateSchema;
      break;
    }

    case 'enum':
      schema = z.enum(input.enum as [string, ...string[]]);
      break;

    case 'csv': {
      // For server validation, CSV is validated as a string (filename or data)
      // Client-side uses File object validation
      const isBrowser =
        typeof globalThis !== 'undefined' && typeof (globalThis as { window?: unknown }).window !== 'undefined';
      if (!isBrowser) {
        // Server-side: validate as string
        schema = z.string().min(1, `${input.label} is required`);
      } else {
        // Client-side: accept either a File (for local validation) OR a string storage key (after upload)
        schema = z.union([buildCSVSchema(input.csv, input.label), z.string().min(1, `${input.label} is required`)]);
      }
      break;
    }

    case 'slider':
      schema = z.number().min(input.min).max(input.max);
      break;

    default:
      schema = z.string();
  }

  // Make optional if not required
  if (input.required === false) {
    schema = schema.optional();
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
function buildCSVSchema(csvConfig: CSVConfig, label: string): z.ZodType {
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
 * Type inference helper for ReputoSchema.
 *
 * Infers the TypeScript type of the validated payload from a ReputoSchema definition.
 * This allows you to get type-safe access to validated data.
 *
 * @example
 * ```typescript
 * const schema: ReputoSchema = {
 *   // ... schema definition
 * }
 * type ValidatedType = InferSchemaType<typeof schema>
 * // ValidatedType will be the inferred type from the schema
 * ```
 */
export type InferSchemaType = z.infer<ReturnType<typeof buildZodSchema>>;
