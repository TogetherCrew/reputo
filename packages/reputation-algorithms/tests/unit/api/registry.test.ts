import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundError } from '../../../src/api';

const hoisted = vi.hoisted(() => {
  const REGISTRY_INDEX = {
    content_moderation: ['1.0.0', '1.1.0', '1.2.0', '2.0.0'],
    engagement_score: ['0.1.0', '0.2.0', '1.0.0'],
    reputation_rank: ['1.0.0'],
    voting_power: ['1.0.0', '1.1.0', '1.2.0', '1.3.0', '2.0.0', '2.1.0'],
  };

  const DEFINITIONS = {
    'content_moderation@1.0.0': {
      key: 'content_moderation',
      name: 'Content Moderation',
      category: 'moderation',
      description: 'Calculates content moderation scores based on user reports',
      version: '1.0.0',
      inputs: [
        {
          key: 'reports',
          label: 'Reports',
          description: 'User reports data',
          type: 'csv',
        },
      ],
      outputs: [
        {
          key: 'moderation_score',
          label: 'Moderation Score',
          type: 'score_map',
          entity: 'content',
          description: 'Content moderation scores',
        },
      ],
    },
    'content_moderation@1.1.0': {
      key: 'content_moderation',
      name: 'Content Moderation',
      category: 'moderation',
      description: 'Enhanced content moderation with weighted reports',
      version: '1.1.0',
      inputs: [
        {
          key: 'reports',
          label: 'Reports',
          description: 'User reports data',
          type: 'csv',
        },
        {
          key: 'weights',
          label: 'Reporter Weights',
          description: 'Weight for each reporter',
          type: 'csv',
        },
      ],
      outputs: [
        {
          key: 'moderation_score',
          label: 'Moderation Score',
          type: 'score_map',
          entity: 'content',
          description: 'Weighted moderation scores',
        },
      ],
    },
    'content_moderation@1.2.0': {
      key: 'content_moderation',
      name: 'Content Moderation',
      category: 'moderation',
      description: 'Advanced content moderation with ML integration',
      version: '1.2.0',
      inputs: [
        {
          key: 'reports',
          label: 'Reports',
          description: 'User reports data',
          type: 'csv',
        },
        {
          key: 'weights',
          label: 'Reporter Weights',
          description: 'Weight for each reporter',
          type: 'csv',
        },
      ],
      outputs: [
        {
          key: 'moderation_score',
          label: 'Moderation Score',
          type: 'score_map',
          entity: 'content',
          description: 'ML-enhanced moderation scores',
        },
      ],
    },
    'content_moderation@2.0.0': {
      key: 'content_moderation',
      name: 'Content Moderation v2',
      category: 'moderation',
      description: 'Complete rewrite with new architecture',
      version: '2.0.0',
      inputs: [
        {
          key: 'events',
          label: 'Moderation Events',
          description: 'All moderation events',
          type: 'csv',
        },
      ],
      outputs: [
        {
          key: 'moderation_score',
          label: 'Moderation Score',
          type: 'score_map',
          entity: 'content',
          description: 'Next-gen moderation scores',
        },
        {
          key: 'confidence',
          label: 'Confidence Level',
          type: 'score_map',
          entity: 'content',
          description: 'Confidence in moderation decision',
        },
      ],
    },
    'engagement_score@0.1.0': {
      key: 'engagement_score',
      name: 'Engagement Score',
      category: 'engagement',
      description: 'Beta version of engagement scoring',
      version: '0.1.0',
      inputs: [
        {
          key: 'activities',
          label: 'User Activities',
          description: 'User activity logs',
          type: 'csv',
        },
      ],
      outputs: [
        {
          key: 'engagement',
          label: 'Engagement Score',
          type: 'score_map',
          entity: 'user',
          description: 'User engagement score',
        },
      ],
    },
    'engagement_score@0.2.0': {
      key: 'engagement_score',
      name: 'Engagement Score',
      category: 'engagement',
      description: 'Improved beta with time-weighted activities',
      version: '0.2.0',
      inputs: [
        {
          key: 'activities',
          label: 'User Activities',
          description: 'User activity logs',
          type: 'csv',
        },
      ],
      outputs: [
        {
          key: 'engagement',
          label: 'Engagement Score',
          type: 'score_map',
          entity: 'user',
          description: 'Time-weighted engagement score',
        },
      ],
    },
    'engagement_score@1.0.0': {
      key: 'engagement_score',
      name: 'Engagement Score',
      category: 'engagement',
      description: 'Production-ready engagement scoring',
      version: '1.0.0',
      inputs: [
        {
          key: 'activities',
          label: 'User Activities',
          description: 'User activity logs',
          type: 'csv',
        },
      ],
      outputs: [
        {
          key: 'engagement',
          label: 'Engagement Score',
          type: 'score_map',
          entity: 'user',
          description: 'Production engagement score',
        },
      ],
    },
    'reputation_rank@1.0.0': {
      key: 'reputation_rank',
      name: 'Reputation Rank',
      category: 'reputation',
      description: 'Basic reputation ranking algorithm',
      version: '1.0.0',
      inputs: [
        {
          key: 'contributions',
          label: 'Contributions',
          description: 'User contributions data',
          type: 'csv',
        },
      ],
      outputs: [
        {
          key: 'reputation',
          label: 'Reputation Score',
          type: 'score_map',
          entity: 'user',
          description: 'User reputation scores',
        },
      ],
    },
    'voting_power@1.0.0': {
      key: 'voting_power',
      name: 'Voting Power',
      category: 'governance',
      description: 'Initial voting power calculation',
      version: '1.0.0',
      inputs: [
        {
          key: 'stakes',
          label: 'Token Stakes',
          description: 'User token stakes',
          type: 'csv',
        },
      ],
      outputs: [
        {
          key: 'voting_power',
          label: 'Voting Power',
          type: 'score_map',
          entity: 'user',
          description: 'Voting power by user',
        },
      ],
    },
    'voting_power@1.1.0': {
      key: 'voting_power',
      name: 'Voting Power',
      category: 'governance',
      description: 'Added time-lock multiplier',
      version: '1.1.0',
      inputs: [
        {
          key: 'stakes',
          label: 'Token Stakes',
          description: 'User token stakes with lock duration',
          type: 'csv',
        },
      ],
      outputs: [
        {
          key: 'voting_power',
          label: 'Voting Power',
          type: 'score_map',
          entity: 'user',
          description: 'Time-adjusted voting power',
        },
      ],
    },
    'voting_power@1.2.0': {
      key: 'voting_power',
      name: 'Voting Power',
      category: 'governance',
      description: 'Added delegation support',
      version: '1.2.0',
      inputs: [
        {
          key: 'stakes',
          label: 'Token Stakes',
          description: 'User token stakes with lock duration',
          type: 'csv',
        },
        {
          key: 'delegations',
          label: 'Delegations',
          description: 'Voting power delegations',
          type: 'csv',
        },
      ],
      outputs: [
        {
          key: 'voting_power',
          label: 'Voting Power',
          type: 'score_map',
          entity: 'user',
          description: 'Delegated voting power',
        },
      ],
    },
    'voting_power@1.3.0': {
      key: 'voting_power',
      name: 'Voting Power',
      category: 'governance',
      description: 'Added quadratic voting option',
      version: '1.3.0',
      inputs: [
        {
          key: 'stakes',
          label: 'Token Stakes',
          description: 'User token stakes',
          type: 'csv',
        },
        {
          key: 'delegations',
          label: 'Delegations',
          description: 'Voting power delegations',
          type: 'csv',
        },
      ],
      outputs: [
        {
          key: 'voting_power',
          label: 'Voting Power',
          type: 'score_map',
          entity: 'user',
          description: 'Quadratic voting power',
        },
      ],
    },
    'voting_power@2.0.0': {
      key: 'voting_power',
      name: 'Voting Power v2',
      category: 'governance',
      description: 'Major rewrite with pluggable strategies',
      version: '2.0.0',
      inputs: [
        {
          key: 'governance_data',
          label: 'Governance Data',
          description: 'All governance-related data',
          type: 'csv',
        },
      ],
      outputs: [
        {
          key: 'voting_power',
          label: 'Voting Power',
          type: 'score_map',
          entity: 'user',
          description: 'Flexible voting power',
        },
      ],
    },
    'voting_power@2.1.0': {
      key: 'voting_power',
      name: 'Voting Power v2.1',
      category: 'governance',
      description: 'Added conviction voting',
      version: '2.1.0',
      inputs: [
        {
          key: 'governance_data',
          label: 'Governance Data',
          description: 'All governance-related data',
          type: 'csv',
        },
      ],
      outputs: [
        {
          key: 'voting_power',
          label: 'Voting Power',
          type: 'score_map',
          entity: 'user',
          description: 'Conviction-based voting power',
        },
        {
          key: 'conviction',
          label: 'Conviction Level',
          type: 'score_map',
          entity: 'user',
          description: 'Voter conviction levels',
        },
      ],
    },
  };

  return { REGISTRY_INDEX, DEFINITIONS };
});

vi.mock('../../../src/registry/index.gen', () => ({
  REGISTRY_INDEX: hoisted.REGISTRY_INDEX,
  _DEFINITIONS: hoisted.DEFINITIONS,
}));

import {
  getAlgorithmDefinition,
  getAlgorithmDefinitionKeys,
  getAlgorithmDefinitionVersions,
  getAlgorithmLatestVersion,
  resolveLatestVersion,
} from '../../../src/api/registry';

describe('API: getAlgorithmDefinitionKeys', () => {
  it('should return all algorithm keys sorted alphabetically (ASCII)', () => {
    const keys = getAlgorithmDefinitionKeys();

    expect(keys).toBeInstanceOf(Array);
    expect(keys).toEqual(['content_moderation', 'engagement_score', 'reputation_rank', 'voting_power']);
  });

  it('should include all algorithms from the registry', () => {
    const keys = getAlgorithmDefinitionKeys();

    expect(keys.length).toBe(4);
    expect(keys).toContain('content_moderation');
    expect(keys).toContain('engagement_score');
    expect(keys).toContain('reputation_rank');
    expect(keys).toContain('voting_power');
  });

  it('should maintain alphabetical sorting even with different key formats', () => {
    const keys = getAlgorithmDefinitionKeys();

    for (let i = 0; i < keys.length - 1; i++) {
      expect(keys[i]! < keys[i + 1]!).toBe(true);
    }
  });
});

describe('API: getAlgorithmDefinitionVersions', () => {
  it('should return versions for algorithms with multiple versions', () => {
    const versions = getAlgorithmDefinitionVersions('voting_power');

    expect(versions).toBeInstanceOf(Array);
    expect(versions.length).toBe(6);
    expect(versions).toEqual(['1.0.0', '1.1.0', '1.2.0', '1.3.0', '2.0.0', '2.1.0']);
  });

  it('should return versions for algorithms with single version', () => {
    const versions = getAlgorithmDefinitionVersions('reputation_rank');

    expect(versions).toBeInstanceOf(Array);
    expect(versions.length).toBe(1);
    expect(versions).toEqual(['1.0.0']);
  });

  it('should return versions sorted by SemVer ascending', () => {
    const versions = getAlgorithmDefinitionVersions('content_moderation');

    expect(versions).toEqual(['1.0.0', '1.1.0', '1.2.0', '2.0.0']);

    for (const version of versions) {
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });

  it('should handle algorithms with 0.x.x pre-release versions', () => {
    const versions = getAlgorithmDefinitionVersions('engagement_score');

    expect(versions).toEqual(['0.1.0', '0.2.0', '1.0.0']);
    expect(versions.length).toBe(3);
  });

  it('should throw NotFoundError with KEY_NOT_FOUND for unknown key', () => {
    expect(() => getAlgorithmDefinitionVersions('unknown_algorithm')).toThrow(NotFoundError);

    try {
      getAlgorithmDefinitionVersions('unknown_algorithm');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      if (error instanceof NotFoundError) {
        expect(error.code).toBe('KEY_NOT_FOUND');
        expect(error.key).toBe('unknown_algorithm');
        expect(error.message).toBe('Algorithm not found');
        expect(error.version).toBeUndefined();
      }
    }
  });

  it('should handle algorithms with major version jumps', () => {
    const versions = getAlgorithmDefinitionVersions('voting_power');

    const v1Versions = versions.filter((v) => v.startsWith('1.'));
    const v2Versions = versions.filter((v) => v.startsWith('2.'));

    expect(v1Versions.length).toBe(4);
    expect(v2Versions.length).toBe(2);
  });
});

describe('API: getAlgorithmLatestVersion', () => {
  it('should return the latest version for algorithms with multiple versions', () => {
    const latest = getAlgorithmLatestVersion('voting_power');

    expect(typeof latest).toBe('string');
    expect(latest).toBe('2.1.0');
  });

  it('should return the only version for single-version algorithms', () => {
    const latest = getAlgorithmLatestVersion('reputation_rank');

    expect(latest).toBe('1.0.0');
  });

  it('should return the highest SemVer version', () => {
    const latest = getAlgorithmLatestVersion('content_moderation');
    const allVersions = getAlgorithmDefinitionVersions('content_moderation');

    expect(latest).toBe(allVersions[allVersions.length - 1]);
    expect(latest).toBe('2.0.0');
  });

  it('should handle algorithms with 0.x.x versions correctly', () => {
    const latest = getAlgorithmLatestVersion('engagement_score');

    expect(latest).toBe('1.0.0');
  });

  it('should return latest patch version when minor version is same', () => {
    const latest = getAlgorithmLatestVersion('voting_power');
    const allVersions = getAlgorithmDefinitionVersions('voting_power');

    expect(latest).toBe('2.1.0');
    expect(latest).toBe(allVersions[allVersions.length - 1]);
  });

  it('should throw NotFoundError for unknown key', () => {
    expect(() => getAlgorithmLatestVersion('non_existent_algo')).toThrow(NotFoundError);

    try {
      getAlgorithmLatestVersion('non_existent_algo');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      if (error instanceof NotFoundError) {
        expect(error.code).toBe('KEY_NOT_FOUND');
        expect(error.key).toBe('non_existent_algo');
      }
    }
  });
});

describe('API: resolveLatestVersion (alias)', () => {
  it('should return the latest version for algorithms with multiple versions', () => {
    const latest = resolveLatestVersion('voting_power');

    expect(typeof latest).toBe('string');
    expect(latest).toBe('2.1.0');
  });

  it('should return the same result as getAlgorithmLatestVersion', () => {
    const algorithms = ['content_moderation', 'engagement_score', 'reputation_rank', 'voting_power'];

    for (const algo of algorithms) {
      const latest1 = resolveLatestVersion(algo);
      const latest2 = getAlgorithmLatestVersion(algo);
      expect(latest1).toBe(latest2);
    }
  });

  it('should work consistently across all algorithms', () => {
    expect(resolveLatestVersion('content_moderation')).toBe('2.0.0');
    expect(resolveLatestVersion('engagement_score')).toBe('1.0.0');
    expect(resolveLatestVersion('reputation_rank')).toBe('1.0.0');
    expect(resolveLatestVersion('voting_power')).toBe('2.1.0');
  });

  it('should throw NotFoundError for unknown key', () => {
    expect(() => resolveLatestVersion('non_existent_algo')).toThrow(NotFoundError);

    try {
      resolveLatestVersion('non_existent_algo');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      if (error instanceof NotFoundError) {
        expect(error.code).toBe('KEY_NOT_FOUND');
        expect(error.key).toBe('non_existent_algo');
      }
    }
  });
});

describe('API: getAlgorithmDefinition', () => {
  describe('valid requests', () => {
    it('should return definition for valid key and version', () => {
      const definition = getAlgorithmDefinition({
        key: 'content_moderation',
        version: '1.0.0',
      });

      expect(definition).toBeDefined();
      expect(definition.key).toBe('content_moderation');
      expect(definition.version).toBe('1.0.0');
      expect(definition.name).toBe('Content Moderation');
      expect(definition.category).toBe('moderation');
      expect(definition.description).toBeTruthy();
    });

    it('should return specific version when requested', () => {
      const v1 = getAlgorithmDefinition({
        key: 'voting_power',
        version: '1.0.0',
      });
      const v2 = getAlgorithmDefinition({
        key: 'voting_power',
        version: '2.1.0',
      });

      expect(v1.version).toBe('1.0.0');
      expect(v2.version).toBe('2.1.0');
      expect(v1.description).not.toBe(v2.description);
    });

    it('should return latest version when version is "latest"', () => {
      const latest = getAlgorithmDefinition({
        key: 'voting_power',
        version: 'latest',
      });

      expect(latest.version).toBe('2.1.0');
    });

    it('should return latest version when version is not specified', () => {
      const definition = getAlgorithmDefinition({
        key: 'content_moderation',
      });

      expect(definition.version).toBe('2.0.0');
    });

    it('should handle single-version algorithms', () => {
      const definition = getAlgorithmDefinition({
        key: 'reputation_rank',
      });

      expect(definition.version).toBe('1.0.0');
      expect(definition.key).toBe('reputation_rank');
    });

    it('should return different definitions for different versions', () => {
      const v1_0 = getAlgorithmDefinition({
        key: 'content_moderation',
        version: '1.0.0',
      });
      const v1_1 = getAlgorithmDefinition({
        key: 'content_moderation',
        version: '1.1.0',
      });
      const v2_0 = getAlgorithmDefinition({
        key: 'content_moderation',
        version: '2.0.0',
      });

      expect(v1_0.inputs).toHaveLength(1);

      expect(v1_1.inputs).toHaveLength(2);

      expect(v2_0.inputs).toHaveLength(1);
      expect(v2_0.outputs).toHaveLength(2);
    });
  });

  describe('structure validation', () => {
    it('should have valid inputs array structure', () => {
      const definition = getAlgorithmDefinition({
        key: 'voting_power',
        version: '1.0.0',
      });

      const inputs = definition.inputs as Array<Record<string, unknown>>;
      expect(Array.isArray(inputs)).toBe(true);
      expect(inputs.length).toBeGreaterThan(0);

      const firstInput = inputs[0];
      if (firstInput) {
        expect(firstInput.key).toBeTruthy();
        expect(firstInput.type).toBeTruthy();
      }
    });

    it('should have valid outputs array structure with at least one output', () => {
      const definition = getAlgorithmDefinition({
        key: 'engagement_score',
        version: '1.0.0',
      });

      const outputs = definition.outputs as Array<Record<string, unknown>>;
      expect(Array.isArray(outputs)).toBe(true);
      expect(outputs.length).toBeGreaterThan(0);

      const firstOutput = outputs[0];
      if (firstOutput) {
        expect(firstOutput.key).toBeTruthy();
        expect(firstOutput.type).toBeTruthy();
      }
    });

    it('should handle algorithms with multiple outputs', () => {
      const definition = getAlgorithmDefinition({
        key: 'voting_power',
        version: '2.1.0',
      });

      const outputs = definition.outputs as Array<Record<string, unknown>>;
      expect(outputs).toHaveLength(2);
      expect(outputs[0]!.key).toBe('voting_power');
      expect(outputs[1]!.key).toBe('conviction');
    });

    it('should validate inputs evolve across versions', () => {
      const v1_2 = getAlgorithmDefinition({
        key: 'voting_power',
        version: '1.2.0',
      });

      const inputs = v1_2.inputs as Array<Record<string, unknown>>;
      expect(inputs).toHaveLength(2);
      expect(inputs[0]!.key).toBe('stakes');
      expect(inputs[1]!.key).toBe('delegations');
    });

    it('should ensure all algorithms have required metadata', () => {
      const algorithms = ['content_moderation', 'engagement_score', 'reputation_rank', 'voting_power'];

      for (const key of algorithms) {
        const definition = getAlgorithmDefinition({ key });

        expect(definition.key).toBeTruthy();
        expect(definition.name).toBeTruthy();
        expect(definition.category).toBeTruthy();
        expect(definition.description).toBeTruthy();
        expect(definition.version).toBeTruthy();
        expect(Array.isArray(definition.inputs)).toBe(true);
        expect(Array.isArray(definition.outputs)).toBe(true);
      }
    });
  });

  describe('error handling', () => {
    it('should throw NotFoundError for unknown key', () => {
      expect(() => getAlgorithmDefinition({ key: 'invalid_key', version: '1.0.0' })).toThrow(NotFoundError);

      try {
        getAlgorithmDefinition({ key: 'invalid_key', version: '1.0.0' });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.code).toBe('KEY_NOT_FOUND');
          expect(error.key).toBe('invalid_key');
        }
      }
    });

    it('should throw NotFoundError for unknown version', () => {
      expect(() =>
        getAlgorithmDefinition({
          key: 'voting_power',
          version: '99.99.99',
        }),
      ).toThrow(NotFoundError);

      try {
        getAlgorithmDefinition({
          key: 'voting_power',
          version: '99.99.99',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.code).toBe('VERSION_NOT_FOUND');
          expect(error.key).toBe('voting_power');
          expect(error.version).toBe('99.99.99');
          expect(error.message).toBe('Version not found');
        }
      }
    });

    it('should throw NotFoundError for versions that do not exist', () => {
      expect(() =>
        getAlgorithmDefinition({
          key: 'content_moderation',
          version: '1.1.5',
        }),
      ).toThrow(NotFoundError);
    });

    it('should throw NotFoundError for older versions when only latest is requested', () => {
      expect(() =>
        getAlgorithmDefinition({
          key: 'reputation_rank',
          version: '0.5.0',
        }),
      ).toThrow(NotFoundError);
    });
  });

  describe('immutability', () => {
    it('should return deep copy (not reference)', () => {
      const def1 = getAlgorithmDefinition({
        key: 'voting_power',
        version: '1.0.0',
      });
      const def2 = getAlgorithmDefinition({
        key: 'voting_power',
        version: '1.0.0',
      });

      expect(def1).toEqual(def2);
      expect(def1).not.toBe(def2);
    });
  });

  describe('version evolution', () => {
    it('should show progression of features across versions', () => {
      const versions = ['1.0.0', '1.1.0', '1.2.0', '1.3.0'];

      for (const version of versions) {
        const def = getAlgorithmDefinition({
          key: 'voting_power',
          version,
        });
        expect(def.version).toBe(version);
        expect(def.key).toBe('voting_power');
      }
    });

    it('should handle major version changes correctly', () => {
      const v1 = getAlgorithmDefinition({
        key: 'content_moderation',
        version: '1.2.0',
      });
      const v2 = getAlgorithmDefinition({
        key: 'content_moderation',
        version: '2.0.0',
      });

      const v1Inputs = v1.inputs as Array<Record<string, unknown>>;
      const v2Inputs = v2.inputs as Array<Record<string, unknown>>;

      expect(v1.name).toBe('Content Moderation');
      expect(v2.name).toBe('Content Moderation v2');
      expect(v1Inputs[0]!.key).toBe('reports');
      expect(v2Inputs[0]!.key).toBe('events');
    });
  });
});
