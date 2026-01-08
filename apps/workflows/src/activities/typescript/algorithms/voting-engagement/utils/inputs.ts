import type { AlgorithmPresetFrozen } from '@reputo/database';

/**
 * Extract the votes file key from algorithm inputs.
 *
 * @param inputs - Raw inputs from the algorithm preset
 * @returns The storage key for the votes CSV file
 * @throws Error if votes input is missing or invalid
 */
export function extractVotesKey(inputs: AlgorithmPresetFrozen['inputs']): string {
  const input = inputs?.find((i) => i.key === 'votes');
  if (!input || typeof input.value !== 'string') {
    throw new Error('Missing or invalid input: votes');
  }
  return input.value;
}
