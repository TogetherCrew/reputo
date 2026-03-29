import type { AlgorithmPresetFrozen } from '@reputo/database';

/**
 * Extract the votes file key from algorithm inputs.
 *
 * @param inputs - Raw inputs from the algorithm preset
 * @returns The storage key for the votes CSV file
 */
export function extractVotesKey(inputs: AlgorithmPresetFrozen['inputs']): string {
  const votesInput = inputs.find((input) => input.key === 'votes');
  if (votesInput == null || typeof votesInput.value !== 'string') {
    throw new Error('Missing required "votes" input');
  }

  return votesInput.value;
}
