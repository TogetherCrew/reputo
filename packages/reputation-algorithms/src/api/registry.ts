import { _DEFINITIONS, REGISTRY_INDEX } from '../registry/index.gen.js';
import { NotFoundError } from '../shared/errors/index.js';
import type { AlgorithmDefinition } from '../shared/types/algorithm.js';

// ——— internal helpers ———
function getVersionsOrThrow(key: string): readonly string[] {
  const versions = REGISTRY_INDEX[key as keyof typeof REGISTRY_INDEX] as readonly string[] | undefined;

  if (!versions) {
    throw new NotFoundError('KEY_NOT_FOUND', key);
  }
  return versions;
}

function resolveVersion(key: string, version: string | 'latest'): string {
  const versions = getVersionsOrThrow(key);
  const resolved = version === 'latest' ? versions[versions.length - 1] : version;

  if (!resolved) {
    throw new NotFoundError('VERSION_NOT_FOUND', key, version);
  }

  if (!versions.includes(resolved)) {
    throw new NotFoundError('VERSION_NOT_FOUND', key, resolved);
  }

  return resolved;
}

/**
 * Checks if a search query matches an algorithm definition.
 * Searches across key, name, description, and category fields.
 */
function matchesQuery(definition: AlgorithmDefinition, query: string): boolean {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return true;

  const searchableFields = [definition.key, definition.name, definition.description, definition.category].filter(
    Boolean,
  );

  return searchableFields.some((field) => field.toLowerCase().includes(normalizedQuery));
}

// ——— public API ———

/**
 * Retrieves all available algorithm definition keys from the registry.
 *
 * @returns A sorted array of algorithm keys available in the registry
 *
 * @example
 * ```ts
 * const keys = getAlgorithmDefinitionKeys()
 * console.log('Available algorithms:', keys)
 * // e.g. ['voting-engagement', 'contribution-score', ...]
 * ```
 */
export function getAlgorithmDefinitionKeys(): readonly string[] {
  return Object.keys(REGISTRY_INDEX).sort();
}

/**
 * Retrieves all available versions for a specific algorithm definition.
 *
 * @param key - The algorithm key to get versions for
 * @returns A readonly array of version strings available for the algorithm
 * @throws {NotFoundError} When the algorithm key is not found in the registry
 *
 * @example
 * ```ts
 * const versions = getAlgorithmDefinitionVersions('my-algorithm')
 * console.log('Available versions:', versions)
 * // e.g. ['1.0.0', '1.1.0', '2.0.0']
 * ```
 */
export function getAlgorithmDefinitionVersions(key: string): readonly string[] {
  return getVersionsOrThrow(key);
}

/**
 * Retrieves algorithm definition(s) by key or search query.
 *
 * @param filters - Object containing filter options
 * @param filters.key - The exact algorithm key to retrieve (returns single definition)
 * @param filters.query - Search query to filter algorithms by name, description, or key (returns array)
 * @param filters.version - The version to retrieve (defaults to 'latest', only used with key)
 * @returns A JSON string - single definition object when using key, array of definitions when using query
 * @throws {NotFoundError} When using key filter and the algorithm key or version is not found
 *
 * @example
 * ```ts
 * // Get specific algorithm by key
 * const definition = getAlgorithmDefinition({ key: 'voting-engagement' })
 *
 * // Get specific version
 * const specific = getAlgorithmDefinition({
 *   key: 'voting-engagement',
 *   version: '1.0.0'
 * })
 *
 * // Search algorithms by query (returns array)
 * const results = getAlgorithmDefinition({ query: 'voting' })
 * const parsed = JSON.parse(results) // AlgorithmDefinition[]
 *
 * // Get all algorithms (empty query)
 * const all = getAlgorithmDefinition({ query: '' })
 * ```
 */
export function getAlgorithmDefinition(filters: { key?: string; query?: string; version?: string | 'latest' }): string {
  const { key, query, version = 'latest' } = filters;

  // If key is provided, return single definition (existing behavior)
  if (key) {
    const resolvedVersion = resolveVersion(key, version);
    const definitionKey = `${key}@${resolvedVersion}`;
    const definition = _DEFINITIONS[definitionKey];
    if (!definition) {
      throw new NotFoundError('KEY_NOT_FOUND', key);
    }
    return JSON.stringify(definition);
  }

  // If query is provided (including empty string), search and return array
  if (query !== undefined) {
    const allKeys = Object.keys(REGISTRY_INDEX);
    const results: AlgorithmDefinition[] = [];

    for (const algoKey of allKeys) {
      const versions = REGISTRY_INDEX[algoKey as keyof typeof REGISTRY_INDEX] as readonly string[];
      const latestVersion = versions[versions.length - 1];
      const definitionKey = `${algoKey}@${latestVersion}`;
      const definition = _DEFINITIONS[definitionKey] as AlgorithmDefinition | undefined;

      if (definition && matchesQuery(definition, query)) {
        results.push(definition);
      }
    }

    return JSON.stringify(results);
  }

  // Neither key nor query provided
  throw new Error('Either key or query must be provided');
}
