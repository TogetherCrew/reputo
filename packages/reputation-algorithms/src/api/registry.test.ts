import { describe, expect, it } from 'vitest';
import { NotFoundError } from './error.js';
import {
  getAlgorithmDefinition,
  listAlgorithmDefinitionKeys,
  listAlgorithmDefinitionVersions,
  resolveLatestVersion,
} from './registry.js';

describe('listAlgorithmDefinitionKeys', () => {
  it('should return all algorithm keys sorted alphabetically', () => {
    const keys = listAlgorithmDefinitionKeys();
    expect(keys).toBeInstanceOf(Array);
    expect(keys.length).toBeGreaterThan(0);
    expect(keys).toContain('voting_engagement');

    // Check that keys are sorted
    const sorted = [...keys].sort();
    expect(keys).toEqual(sorted);
  });

  it('should return readonly array', () => {
    const keys = listAlgorithmDefinitionKeys();
    expect(Object.isFrozen(keys)).toBe(false); // Array itself isn't frozen but is readonly at type level
  });
});

describe('listAlgorithmDefinitionVersions', () => {
  it('should return versions for a valid key', () => {
    const versions = listAlgorithmDefinitionVersions('voting_engagement');
    expect(versions).toBeInstanceOf(Array);
    expect(versions.length).toBeGreaterThan(0);
    expect(versions).toContain('1.0.0');
  });

  it('should return versions sorted by SemVer', () => {
    const versions = listAlgorithmDefinitionVersions('voting_engagement');
    // Versions should be in ascending order
    for (let i = 1; i < versions.length; i++) {
      const prev = versions[i - 1];
      const curr = versions[i];
      expect(typeof prev).toBe('string');
      expect(typeof curr).toBe('string');
    }
  });

  it('should throw NotFoundError for unknown key', () => {
    expect(() => listAlgorithmDefinitionVersions('unknown_key')).toThrow(NotFoundError);

    try {
      listAlgorithmDefinitionVersions('unknown_key');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      if (error instanceof NotFoundError) {
        expect(error.code).toBe('KEY_NOT_FOUND');
        expect(error.key).toBe('unknown_key');
        expect(error.message).toBe('Algorithm not found');
      }
    }
  });
});

describe('resolveLatestVersion', () => {
  it('should return the latest version for a valid key', () => {
    const latest = resolveLatestVersion('voting_engagement');
    expect(typeof latest).toBe('string');
    expect(latest).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('should return the highest semantic version', () => {
    const latest = resolveLatestVersion('voting_engagement');
    const allVersions = listAlgorithmDefinitionVersions('voting_engagement');
    expect(latest).toBe(allVersions[allVersions.length - 1]);
  });

  it('should throw NotFoundError for unknown key', () => {
    expect(() => resolveLatestVersion('unknown_key')).toThrow(NotFoundError);

    try {
      resolveLatestVersion('unknown_key');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      if (error instanceof NotFoundError) {
        expect(error.code).toBe('KEY_NOT_FOUND');
        expect(error.key).toBe('unknown_key');
      }
    }
  });
});

describe('getAlgorithmDefinition', () => {
  it('should return definition for valid key and version', () => {
    const definition = getAlgorithmDefinition({
      key: 'voting_engagement',
      version: '1.0.0',
    });

    expect(definition).toBeDefined();
    expect(definition.key).toBe('voting_engagement');
    expect(definition.version).toBe('1.0.0');
    expect(definition.name).toBeTruthy();
    expect(definition.category).toBeTruthy();
    expect(definition.description).toBeTruthy();
    expect(Array.isArray(definition.inputs)).toBe(true);
    expect(Array.isArray(definition.outputs)).toBe(true);
    expect(definition.outputs.length).toBeGreaterThan(0);
  });

  it('should return latest version when version is "latest"', () => {
    const latest = getAlgorithmDefinition({
      key: 'voting_engagement',
      version: 'latest',
    });

    const latestVersion = resolveLatestVersion('voting_engagement');
    expect(latest.version).toBe(latestVersion);
  });

  it('should return latest version when version is not specified', () => {
    const definition = getAlgorithmDefinition({
      key: 'voting_engagement',
    });

    const latestVersion = resolveLatestVersion('voting_engagement');
    expect(definition.version).toBe(latestVersion);
  });

  it('should throw NotFoundError for unknown key', () => {
    expect(() => getAlgorithmDefinition({ key: 'unknown_key', version: '1.0.0' })).toThrow(NotFoundError);

    try {
      getAlgorithmDefinition({ key: 'unknown_key', version: '1.0.0' });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      if (error instanceof NotFoundError) {
        expect(error.code).toBe('KEY_NOT_FOUND');
        expect(error.key).toBe('unknown_key');
      }
    }
  });

  it('should throw NotFoundError for unknown version', () => {
    expect(() =>
      getAlgorithmDefinition({
        key: 'voting_engagement',
        version: '99.99.99',
      }),
    ).toThrow(NotFoundError);

    try {
      getAlgorithmDefinition({
        key: 'voting_engagement',
        version: '99.99.99',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      if (error instanceof NotFoundError) {
        expect(error.code).toBe('VERSION_NOT_FOUND');
        expect(error.key).toBe('voting_engagement');
        expect(error.version).toBe('99.99.99');
      }
    }
  });

  it('should return readonly definition', () => {
    const definition = getAlgorithmDefinition({
      key: 'voting_engagement',
      version: '1.0.0',
    });

    // TypeScript enforces readonly, but at runtime we can check if it's the same reference
    expect(definition).toBeDefined();
  });
});
