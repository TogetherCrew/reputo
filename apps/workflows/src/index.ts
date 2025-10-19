import { getAlgorithmDefinitionKeys } from '@reputo/reputation-algorithms';

export function getAvailableAlgorithms(): readonly string[] {
  return getAlgorithmDefinitionKeys();
}
