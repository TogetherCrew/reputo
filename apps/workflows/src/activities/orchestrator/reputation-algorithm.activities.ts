import { getAlgorithmDefinition as getDefinition } from '@reputo/reputation-algorithms';
import { Context } from '@temporalio/activity';

import type {
  AlgorithmLibraryActivities,
  GetAlgorithmDefinitionInput,
  GetAlgorithmDefinitionOutput,
} from '../../shared/types/index.js';

export function createAlgorithmLibraryActivities(): AlgorithmLibraryActivities {
  return {
    async getAlgorithmDefinition(input: GetAlgorithmDefinitionInput): Promise<GetAlgorithmDefinitionOutput> {
      const logger = Context.current().log;
      const { key, version } = input;

      logger.info('Loading algorithm definition', { key, version });

      const definitionJson = getDefinition({ key, version });

      if (!definitionJson) {
        const identifier = version ? `${key}@${version}` : key;
        logger.error('Algorithm definition not found', { key, version });
        throw new Error(`Algorithm definition not found: ${identifier}`);
      }

      const definition = JSON.parse(definitionJson);

      logger.info('Algorithm definition loaded successfully', {
        key: definition.key,
        version: definition.version,
        runtime: definition.runtime,
      });

      return { definition };
    },
  };
}
