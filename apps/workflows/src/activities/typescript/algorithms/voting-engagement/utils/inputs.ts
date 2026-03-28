import type { AlgorithmPresetFrozen } from '@reputo/database';

/**
 * Extract the votes file key from algorithm inputs.
 *
 * @param inputs - Raw inputs from the algorithm preset
 * @returns The storage key for the votes CSV file
 */
export function extractVotesKey(inputs: AlgorithmPresetFrozen['inputs']): string {
  return inputs.find((i) => i.key === 'votes')!.value as string;
}
