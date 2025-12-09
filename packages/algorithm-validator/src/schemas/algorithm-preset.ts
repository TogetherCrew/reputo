/**
 * Zod schemas for Algorithm Preset validation.
 *
 * These schemas are used by both frontend and backend to ensure consistent
 * validation of algorithm preset creation payloads.
 */

import { z } from 'zod/v4';

/**
 * Zod schema for validating a single algorithm preset input.
 *
 * Each input must have a key (string) and a value (any non-null/undefined value).
 */
export const algorithmPresetInputSchema: z.ZodObject<{
  key: z.ZodString;
  value: z.ZodUnknown;
}> = z.object({
  key: z.string().min(1, 'Input key is required'),
  value: z.unknown().refine((val) => val !== undefined && val !== null, {
    message: 'Input value is required',
  }),
});

/**
 * Zod schema for validating algorithm preset creation payloads.
 *
 * Validates the complete structure required to create an algorithm preset:
 * - key: Algorithm key (required, non-empty string)
 * - version: Algorithm version (required, non-empty string)
 * - inputs: Array of inputs (required, at least one)
 * - name: Optional name (3-100 characters if provided)
 * - description: Optional description (10-500 characters if provided)
 */
export const createAlgorithmPresetSchema: z.ZodObject<{
  key: z.ZodString;
  version: z.ZodString;
  inputs: z.ZodArray<z.ZodObject<{ key: z.ZodString; value: z.ZodUnknown }>>;
  name: z.ZodOptional<z.ZodString>;
  description: z.ZodOptional<z.ZodString>;
}> = z.object({
  key: z.string().min(1, 'Algorithm key is required'),
  version: z.string().min(1, 'Algorithm version is required'),
  inputs: z.array(algorithmPresetInputSchema).min(1, 'At least one input is required'),
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be at most 500 characters')
    .optional(),
});

/**
 * TypeScript type inferred from the create algorithm preset Zod schema.
 *
 * Use this type for type-safe algorithm preset creation payloads.
 */
export type CreateAlgorithmPresetInput = z.infer<typeof createAlgorithmPresetSchema>;

/**
 * TypeScript type for a single algorithm preset input.
 *
 * Represents one input in the inputs array of a preset.
 */
export type AlgorithmPresetInputType = z.infer<typeof algorithmPresetInputSchema>;

/**
 * Validates algorithm preset creation payload using Zod schema.
 *
 * This is a convenience function that wraps the Zod schema's safeParse method,
 * providing a consistent validation interface for algorithm preset creation.
 *
 * @param data - The data to validate against the algorithm preset schema
 * @returns Zod's SafeParseReturnType containing either the validated data or error details
 *
 * @example
 * ```typescript
 * const result = validateCreateAlgorithmPreset({
 *   key: 'voting_engagement',
 *   version: '1.0.0',
 *   inputs: [{ key: 'threshold', value: 0.5 }],
 *   name: 'Voting Engagement',
 *   description: 'Calculates engagement based on voting patterns'
 * })
 *
 * if (result.success) {
 *   const preset: CreateAlgorithmPresetInput = result.data
 *   // Use validated preset data
 * } else {
 *   console.error('Validation errors:', result.error)
 * }
 * ```
 */
export function validateCreateAlgorithmPreset(data: unknown): ReturnType<typeof createAlgorithmPresetSchema.safeParse> {
  return createAlgorithmPresetSchema.safeParse(data);
}
