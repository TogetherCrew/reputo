import { _DEFINITIONS, REGISTRY_INDEX } from '../registry/index.gen';
import { NotFoundError } from './error.js';
import type { AlgorithmDefinition, AlgorithmKey, VersionString } from './types.js';

/**
 * Lists all available algorithm keys, sorted by ASCII comparison (ascending)
 * @returns Readonly array of algorithm keys
 */
export function listAlgorithmDefinitionKeys(): readonly AlgorithmKey[] {
  return Object.keys(REGISTRY_INDEX).sort();
}

/**
 * Lists all versions for a given algorithm key, sorted by SemVer (ascending)
 * @param key - The algorithm key
 * @returns Readonly array of version strings
 * @throws {NotFoundError} If the key is not found
 */
export function listAlgorithmDefinitionVersions(key: AlgorithmKey): readonly VersionString[] {
  const versions = REGISTRY_INDEX[key as keyof typeof REGISTRY_INDEX];

  if (!versions) {
    throw new NotFoundError('KEY_NOT_FOUND', key);
  }

  return versions;
}

/**
 * Resolves the latest version for a given algorithm key
 * @param key - The algorithm key
 * @returns The highest version string (by SemVer)
 * @throws {NotFoundError} If the key is not found or has no versions
 */
export function resolveLatestVersion(key: AlgorithmKey): VersionString {
  const versions = REGISTRY_INDEX[key as keyof typeof REGISTRY_INDEX];

  if (!versions) {
    throw new NotFoundError('KEY_NOT_FOUND', key);
  }

  const lastVersion = versions[versions.length - 1];

  if (!lastVersion) {
    throw new NotFoundError('VERSION_NOT_FOUND', key, 'latest');
  }

  return lastVersion as VersionString;
}

/**
 * Gets an algorithm definition by key and optional version
 * @param opts - Options object with key and optional version
 * @returns Readonly algorithm definition
 * @throws {NotFoundError} If the key or version is not found
 */
export function getAlgorithmDefinition(opts: {
  key: AlgorithmKey;
  version?: VersionString | 'latest';
}): Readonly<AlgorithmDefinition> {
  const { key, version = 'latest' } = opts;

  const versions = REGISTRY_INDEX[key as keyof typeof REGISTRY_INDEX];

  if (!versions) {
    throw new NotFoundError('KEY_NOT_FOUND', key);
  }

  const resolvedVersion = version === 'latest' ? resolveLatestVersion(key) : version;

  if (!versions.includes(resolvedVersion as never)) {
    throw new NotFoundError('VERSION_NOT_FOUND', key, resolvedVersion);
  }

  const definitionKey = `${key}@${resolvedVersion}` as keyof typeof _DEFINITIONS;
  const definition = _DEFINITIONS[definitionKey];

  if (!definition) {
    throw new NotFoundError('VERSION_NOT_FOUND', key, resolvedVersion);
  }

  return definition as Readonly<AlgorithmDefinition>;
}
