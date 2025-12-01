/**
 * Algorithm library activities for Temporal workflows.
 *
 * Provides activities for loading algorithm definitions from the
 * @reputo/reputation-algorithms package.
 */

import type { AlgorithmDefinition } from '@reputo/reputation-algorithms';
import { getAlgorithmDefinition as getAlgorithmDefinitionFromRegistry } from '@reputo/reputation-algorithms';
import { Context } from '@temporalio/activity';

/**
 * Input for getAlgorithmDefinition activity.
 */
export interface GetAlgorithmDefinitionInput {
  /** Algorithm key (e.g., 'voting_engagement') */
  key: string;
  /** Algorithm version (e.g., '1.0.0' or 'latest') */
  version?: string | 'latest';
}

/**
 * Output for getAlgorithmDefinition activity.
 */
export interface GetAlgorithmDefinitionOutput {
  /** Complete algorithm definition including runtime metadata */
  definition: AlgorithmDefinition;
}

/**
 * Algorithm library activities registry.
 */
export interface AlgorithmLibraryActivities {
  getAlgorithmDefinition: (input: GetAlgorithmDefinitionInput) => Promise<GetAlgorithmDefinitionOutput>;
}

/**
 * Creates algorithm library activities.
 *
 * @returns Algorithm library activities object
 */
export function createAlgorithmLibraryActivities(): AlgorithmLibraryActivities {
  return {
    /**
     * Loads an algorithm definition from the registry.
     *
     * @param input - Algorithm key and optional version
     * @returns The complete algorithm definition
     * @throws Error if algorithm key or version is not found
     *
     * @example
     * ```ts
     * const { definition } = await getAlgorithmDefinition({
     *   key: 'voting_engagement',
     *   version: '1.0.0'
     * })
     * ```
     */
    async getAlgorithmDefinition(input: GetAlgorithmDefinitionInput): Promise<GetAlgorithmDefinitionOutput> {
      const logger = Context.current().log;
      const version = input.version ?? 'latest';

      logger.info('Loading algorithm definition', {
        key: input.key,
        version,
      });

      try {
        // Get definition from registry (returns JSON string)
        const definitionJson = getAlgorithmDefinitionFromRegistry({
          key: input.key,
          version,
        });

        const definition = JSON.parse(definitionJson) as AlgorithmDefinition;

        logger.info('Algorithm definition loaded successfully', {
          key: definition.key,
          version: definition.version,
          runtime: definition.runtime,
        });

        return { definition };
      } catch (error) {
        const err = error as Error;
        logger.error('Failed to load algorithm definition', {
          key: input.key,
          version,
          error: err.message,
        });
        throw new Error(`Algorithm definition not found: ${input.key}@${version}`);
      }
    },
  };
}
