import { _DEFINITIONS, REGISTRY_INDEX } from '../registry/index.gen.js';
import { NotFoundError } from '../shared/errors/index.js';
import type { AlgorithmDefinition } from '../shared/types/algorithm.js';

function getAlgorithmDefinitionVersionsByKey(key: string): readonly string[] {
  const versions = REGISTRY_INDEX[key as keyof typeof REGISTRY_INDEX];

  if (!versions) {
    throw new NotFoundError('KEY_NOT_FOUND', key);
  }

  return versions;
}

function resolveAlgorithmDefinitionVersion(key: string, version: string | 'latest'): string {
  const versions = getAlgorithmDefinitionVersionsByKey(key);

  const resolved = version === 'latest' ? versions[versions.length - 1] : version;

  if (!resolved) {
    throw new NotFoundError('VERSION_NOT_FOUND', key, 'latest');
  }

  if (!versions.includes(resolved as never)) {
    throw new NotFoundError('VERSION_NOT_FOUND', key, resolved);
  }

  return resolved as string;
}

/**
 * Retrieves all available algorithm definition keys from the registry.
 *
 * @returns A sorted array of algorithm keys that are available in the registry
 *
 * @example
 * ```typescript
 * const keys = getAlgorithmDefinitionKeys();
 * console.log('Available algorithms:', keys);
 * // Output: ['voting-engagement', 'contrubition-score', ...]
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
 * ```typescript
 * const versions = getAlgorithmDefinitionVersions('my-algorithm');
 * console.log('Available versions:', versions);
 * // Output: ['1.0.0', '1.1.0', '2.0.0']
 * ```
 */
export function getAlgorithmDefinitionVersions(key: string): readonly string[] {
  return getAlgorithmDefinitionVersionsByKey(key);
}

/**
 * Retrieves the latest version for a specific algorithm definition.
 *
 * @param key - The algorithm key to get the latest version for
 * @returns The latest version string for the algorithm
 * @throws {NotFoundError} When the algorithm key is not found in the registry
 *
 * @example
 * ```typescript
 * const latestVersion = getAlgorithmDefinitionLatestVersion('voting-engagement');
 * console.log('Latest version:', latestVersion);
 * // Output: '2.0.0'
 * ```
 */
export function getAlgorithmDefinitionLatestVersion(key: string): string {
  return resolveAlgorithmDefinitionVersion(key, 'latest');
}

/**
 * Retrieves the latest version for a specific algorithm definition.
 * Alias for getAlgorithmDefinitionLatestVersion for backward compatibility.
 *
 * @param key - The algorithm key to get the latest version for
 * @returns The latest version string for the algorithm
 * @throws {NotFoundError} When the algorithm key is not found in the registry
 *
 * @example
 * ```typescript
 * const latestVersion = getAlgorithmLatestVersion('voting-engagement');
 * console.log('Latest version:', latestVersion);
 * // Output: '2.0.0'
 * ```
 */
export function getAlgorithmLatestVersion(key: string): string {
  return getAlgorithmDefinitionLatestVersion(key);
}

/**
 * Resolves the latest version for a specific algorithm definition.
 * Alias for getAlgorithmLatestVersion for convenience.
 *
 * @param key - The algorithm key to get the latest version for
 * @returns The latest version string for the algorithm
 * @throws {NotFoundError} When the algorithm key is not found in the registry
 *
 * @example
 * ```typescript
 * const latestVersion = resolveLatestVersion('voting-engagement');
 * console.log('Latest version:', latestVersion);
 * // Output: '2.0.0'
 * ```
 */
export function resolveLatestVersion(key: string): string {
  return getAlgorithmLatestVersion(key);
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
 * ```typescript
 * const definition = getAlgorithmDefinition({ key: 'voting-engagement' });
 *
 * const definition = getAlgorithmDefinition({
 *   key: 'voting-engagement',
 *   version: '1.0.0'
 * });
 *
 * console.log('Algorithm definition:', definition);
 * // Output: { "key": "voting-engagement", "version": "1.0.0", ... }
 * ```
 */
export function getAlgorithmDefinition(filters: { key: string; version?: string | 'latest' }): AlgorithmDefinition {
  const { key, version = 'latest' } = filters;
  const resolvedVersion = resolveAlgorithmDefinitionVersion(key, version);
  const definitionKey = `${key}@${resolvedVersion}` as keyof typeof _DEFINITIONS;
  const definition = _DEFINITIONS[definitionKey];

  if (!definition) {
    throw new NotFoundError('KEY_NOT_FOUND', key);
  }

  // Return a deep copy to ensure immutability
  return JSON.parse(JSON.stringify(definition));
}
