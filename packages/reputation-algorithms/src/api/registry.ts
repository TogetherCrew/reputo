import { _DEFINITIONS, REGISTRY_INDEX } from '../registry/index.gen.js';
import { NotFoundError } from '../shared/errors/index.js';

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
    throw new NotFoundError('VERSION_NOT_FOUND', key, 'latest');
  }

  if (!versions.includes(resolved)) {
    throw new NotFoundError('VERSION_NOT_FOUND', key, resolved);
  }

  return resolved;
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
 * Retrieves a complete algorithm definition by key and version.
 *
 * @param filters - Object containing the algorithm key and optional version
 * @param filters.key - The algorithm key to retrieve
 * @param filters.version - The version to retrieve (defaults to 'latest')
 * @returns A deep copy of the algorithm definition object
 * @throws {NotFoundError} When the algorithm key or version is not found
 *
 * @example
 * ```ts
 * const definition = getAlgorithmDefinition({ key: 'voting-engagement' })
 *
 * const specific = getAlgorithmDefinition({
 *   key: 'voting-engagement',
 *   version: '1.0.0'
 * })
 * ```
 */

/**
 * Retrieves a complete algorithm definition by key and version.
 *
 * @param filters - Object containing the algorithm key and optional version
 * @param filters.key - The algorithm key to retrieve
 * @param filters.version - The version to retrieve (defaults to 'latest')
 * @returns A JSON string representation of the algorithm definition object
 * @throws {NotFoundError} When the algorithm key or version is not found
 *
 * @example
 * ```ts
 * const definition = getAlgorithmDefinition({ key: 'voting-engagement' })
 *
 * const specific = getAlgorithmDefinition({
 *   key: 'voting-engagement',
 *   version: '1.0.0'
 * })
 * ```
 */
export function getAlgorithmDefinition(filters: { key: string; version?: string | 'latest' }): string {
  const { key, version = 'latest' } = filters;
  const resolvedVersion = resolveVersion(key, version);
  const definitionKey = `${key}@${resolvedVersion}`;
  const definition = _DEFINITIONS[definitionKey];
  if (!definition) {
    throw new NotFoundError('KEY_NOT_FOUND', key);
  }
  return JSON.stringify(definition);
}
