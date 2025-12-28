import { beforeEach, describe, expect, it } from 'vitest';
import {
  AlgorithmValidator,
  compareSemVer,
  createValidatorWithSchema,
  validateKey,
  validateVersion,
} from '../../../../src/shared/utils/validation.js';

describe('Validation Utils', () => {
  describe('validateKey', () => {
    it('should accept valid snake_case keys', () => {
      const validKeys = ['user_activity', 'voting_engagement', 'content_quality', 'a1', 'test_123', 'algorithm_v2'];

      for (const key of validKeys) {
        const result = validateKey(key);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      }
    });

    it('should reject keys with invalid format', () => {
      const invalidKeys = [
        'InvalidKey',
        'INVALID_KEY',
        'invalid-key',
        '123invalid',
        'invalid key',
        'invalid.key',
        'a',
        '',
      ];

      for (const key of invalidKeys) {
        const result = validateKey(key);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('should provide helpful error messages', () => {
      const result = validateKey('Invalid-Key');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('snake_case');
      expect(result.errors[0]).toContain('lowercase');
    });
  });

  describe('validateVersion', () => {
    it('should accept valid semantic versions', () => {
      const validVersions = [
        '1.0.0',
        '2.1.3',
        '10.20.30',
        '1.0.0-alpha',
        '1.0.0-beta.1',
        '1.0.0-rc.1',
        '1.0.0+build.1',
        '1.0.0-alpha+build.1',
        '0.0.1',
      ];

      for (const version of validVersions) {
        const result = validateVersion(version);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      }
    });

    it('should reject invalid version formats', () => {
      const invalidVersions = ['v1.0.0', '1.0', '1', '1.0.0.0', '', 'latest'];

      for (const version of invalidVersions) {
        const result = validateVersion(version);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('should provide helpful error messages', () => {
      const result = validateVersion('v1.0.0');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('semantic version');
      expect(result.errors[0]).toContain('1.0.0');
    });
  });

  describe('compareSemVer', () => {
    it('should sort versions in ascending order', () => {
      const versions = ['2.0.0', '1.0.0', '1.5.0', '1.0.1'];
      const sorted = [...versions].sort(compareSemVer);
      expect(sorted).toEqual(['1.0.0', '1.0.1', '1.5.0', '2.0.0']);
    });

    it('should handle prerelease versions correctly', () => {
      const versions = ['1.0.0', '1.0.0-beta', '1.0.0-alpha'];
      const sorted = [...versions].sort(compareSemVer);
      expect(sorted).toEqual(['1.0.0-alpha', '1.0.0-beta', '1.0.0']);
    });

    it('should handle build metadata (ignored in comparison)', () => {
      const versions = ['1.0.0+build.2', '1.0.0+build.1', '1.0.0'];
      const sorted = [...versions].sort(compareSemVer);
      expect(sorted[sorted.length - 1]).toBe('1.0.0');
    });

    it('should compare major versions correctly', () => {
      expect(compareSemVer('2.0.0', '1.0.0')).toBeGreaterThan(0);
      expect(compareSemVer('1.0.0', '2.0.0')).toBeLessThan(0);
    });

    it('should compare minor versions correctly', () => {
      expect(compareSemVer('1.2.0', '1.1.0')).toBeGreaterThan(0);
      expect(compareSemVer('1.1.0', '1.2.0')).toBeLessThan(0);
    });

    it('should compare patch versions correctly', () => {
      expect(compareSemVer('1.0.2', '1.0.1')).toBeGreaterThan(0);
      expect(compareSemVer('1.0.1', '1.0.2')).toBeLessThan(0);
    });

    it('should return 0 for equal versions', () => {
      expect(compareSemVer('1.0.0', '1.0.0')).toBe(0);
    });

    it('should handle complex prerelease sorting', () => {
      const versions = [
        '1.0.0',
        '1.0.0-rc.1',
        '1.0.0-beta.11',
        '1.0.0-beta.2',
        '1.0.0-alpha.beta',
        '1.0.0-alpha.1',
        '1.0.0-alpha',
      ];
      const sorted = [...versions].sort(compareSemVer);

      expect(sorted[sorted.length - 1]).toBe('1.0.0');

      const alphaIndex = sorted.findIndex((v) => v === '1.0.0-alpha');
      const betaIndex = sorted.findIndex((v) => v === '1.0.0-beta.2');
      expect(alphaIndex).toBeLessThan(betaIndex);
    });
  });

  describe('AlgorithmValidator', () => {
    let validator: AlgorithmValidator;

    beforeEach(() => {
      validator = createValidatorWithSchema();
    });

    it('should validate a correct algorithm definition', () => {
      const validDefinition = {
        key: 'test_algorithm',
        name: 'Test Algorithm',
        category: 'Activity',
        summary: 'A test algorithm',
        description: 'A test algorithm',
        version: '1.0.0',
        inputs: [
          {
            key: 'input_data',
            label: 'Input Data',
            type: 'csv',
            csv: {
              hasHeader: true,
              delimiter: ',',
              columns: [
                {
                  key: 'user_id',
                  type: 'string',
                  description: 'User identifier',
                },
              ],
            },
          },
        ],
        outputs: [
          {
            key: 'result',
            type: 'csv',
            csv: {
              hasHeader: true,
              delimiter: ',',
              columns: [
                { key: 'collection_id', type: 'string', description: 'User identifier' },
                { key: 'result', type: 'number', description: 'Result score' },
              ],
            },
          },
        ],
        runtime: {
          taskQueue: 'typescript-worker',
          activity: 'test_algorithm',
        },
      };

      const result = validator.validate(validDefinition);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject invalid algorithm definition', () => {
      const invalidDefinition = {
        key: 'InvalidKey',
      };

      const result = validator.validate(invalidDefinition);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should throw ValidationError when using validateAndThrow', () => {
      const invalidDefinition = {
        key: 'InvalidKey',
      };

      expect(() => {
        validator.validateAndThrow(invalidDefinition, 'test-file.json');
      }).toThrow();
    });

    it('should return definition when validateAndThrow succeeds', () => {
      const validDefinition = {
        key: 'test_algorithm',
        name: 'Test Algorithm',
        category: 'Activity',
        summary: 'A test algorithm',
        description: 'A test algorithm',
        version: '1.0.0',
        inputs: [],
        outputs: [
          {
            key: 'result',
            type: 'csv',
            csv: {
              hasHeader: true,
              delimiter: ',',
              columns: [
                { key: 'collection_id', type: 'string', description: 'User identifier' },
                { key: 'result', type: 'number', description: 'Result score' },
              ],
            },
          },
        ],
        runtime: {
          taskQueue: 'typescript-worker',
          activity: 'test_algorithm',
        },
      };

      const result = validator.validateAndThrow(validDefinition);
      expect(result).toEqual(validDefinition);
    });

    it('should provide access to underlying AJV instance', () => {
      const ajv = validator.getAjv();
      expect(ajv).toBeDefined();
      expect(typeof ajv.compile).toBe('function');
    });
  });

  describe('createValidatorWithSchema', () => {
    it('should create a validator with loaded schema', () => {
      const validator = createValidatorWithSchema();
      expect(validator).toBeInstanceOf(AlgorithmValidator);

      const result = validator.validate({
        key: 'test',
        name: 'Test',
        category: 'Activity',
        summary: 'Test',
        description: 'Test',
        version: '1.0.0',
        inputs: [],
        outputs: [
          {
            key: 'result',
            type: 'csv',
            csv: {
              hasHeader: true,
              delimiter: ',',
              columns: [
                { key: 'collection_id', type: 'string', description: 'User identifier' },
                { key: 'result', type: 'number', description: 'Result score' },
              ],
            },
          },
        ],
        runtime: {
          taskQueue: 'typescript-worker',
          activity: 'test',
        },
      });

      expect(result.isValid).toBe(true);
    });
  });
});
