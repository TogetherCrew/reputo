import type { AlgorithmPresetFrozen } from '@reputo/database';

import { MissingInputError } from '../errors/index.js';

export function getInputValue(inputs: AlgorithmPresetFrozen['inputs'], inputKey: string): string {
  const entry = inputs.find((i) => i.key === inputKey);
  if (!entry) {
    throw new MissingInputError(inputKey);
  }
  if (typeof entry.value !== 'string') {
    throw new MissingInputError(inputKey);
  }
  return entry.value;
}
