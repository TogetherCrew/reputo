import { _DEFINITIONS, REGISTRY_INDEX } from '../registry/index.gen';
import { NotFoundError } from '../shared/errors';

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

export function getAlgorithmDefinitionKeys(): readonly string[] {
  return Object.keys(REGISTRY_INDEX).sort();
}

export function getAlgorithmDefinitionVersions(key: string): readonly string[] {
  return getAlgorithmDefinitionVersionsByKey(key);
}

export function getAlgorithmLatestVersion(key: string): string {
  return resolveAlgorithmDefinitionVersion(key, 'latest');
}

export const resolveLatestVersion: (key: string) => string = getAlgorithmLatestVersion;

export function getAlgorithmDefinition(filters: { key: string; version?: string | 'latest' }): Record<string, unknown> {
  const { key, version = 'latest' } = filters;
  const resolvedVersion = resolveAlgorithmDefinitionVersion(key, version);
  const definitionKey = `${key}@${resolvedVersion}` as keyof typeof _DEFINITIONS;
  const definition = _DEFINITIONS[definitionKey];
  return JSON.parse(JSON.stringify(definition)) as Record<string, unknown>;
}
