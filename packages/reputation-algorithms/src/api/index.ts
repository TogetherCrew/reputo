export { NotFoundError } from './error';

export type VersionString = `${number}.${number}.${number}${'' | `-${string}` | `+${string}`}`;

export function getAlgorithmJsonSchema(): Readonly<unknown> {
  return Object.freeze({});
}

export function listAlgorithmDefinitionKeys(): readonly string[] {
  return Object.freeze([]);
}

export function listAlgorithmDefinitionVersions(_key: string): readonly VersionString[] {
  return Object.freeze([]);
}

export function getAlgorithmDefinition(_opts: {
  key: string;
  version?: VersionString | 'latest';
}): Readonly<Record<string, unknown>> {
  return Object.freeze({});
}
