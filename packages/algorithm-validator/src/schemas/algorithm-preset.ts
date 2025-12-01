/**
 * Zod schemas for Algorithm Preset validation
 * Used by both frontend and backend
 */

import { z } from 'zod/v4';

/**
 * Zod schema for algorithm preset input validation
 */
export const algorithmPresetInputSchema = z.object({
  key: z.string().min(1, 'Input key is required'),
  value: z.unknown().refine((val) => val !== undefined && val !== null, {
    message: 'Input value is required',
  }),
});

/**
 * Zod schema for CreateAlgorithmPresetDto validation
 */
export const createAlgorithmPresetSchema = z.object({
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
 * Type inferred from Zod schema
 */
export type CreateAlgorithmPresetInput = z.infer<typeof createAlgorithmPresetSchema>;

/**
 * Type for algorithm preset input
 */
export type AlgorithmPresetInputType = z.infer<typeof algorithmPresetInputSchema>;

/**
 * Validates CreateAlgorithmPresetDto using Zod schema
 * @param data - The data to validate
 * @returns Validation result with parsed data or errors
 */
export function validateCreateAlgorithmPreset(data: unknown) {
  return createAlgorithmPresetSchema.safeParse(data);
}
