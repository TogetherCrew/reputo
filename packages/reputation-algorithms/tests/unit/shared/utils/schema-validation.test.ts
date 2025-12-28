import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it } from 'vitest';
import { type AlgorithmValidator, createValidatorWithSchema } from '../../../../src/shared/utils/validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Build: Schema Validation', () => {
  let validator: AlgorithmValidator;

  beforeEach(() => {
    validator = createValidatorWithSchema();
  });

  describe('Valid Fixtures', () => {
    it('should validate sample-algorithm.json', () => {
      const fixturePath = join(__dirname, '../../../fixtures/valid/sample-algorithm.json');
      const fixture = JSON.parse(readFileSync(fixturePath, 'utf-8'));

      const result = validator.validate(fixture);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate voting_engagement from registry', () => {
      const algorithmPath = join(__dirname, '../../../../src/registry/voting_engagement/1.0.0.json');
      const algorithm = JSON.parse(readFileSync(algorithmPath, 'utf-8'));

      const result = validator.validate(algorithm);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('Invalid Fixtures', () => {
    it('should reject invalid-key.json with invalid key format', () => {
      const fixturePath = join(__dirname, '../../../fixtures/invalid/invalid-key.json');
      const fixture = JSON.parse(readFileSync(fixturePath, 'utf-8'));

      const result = validator.validate(fixture);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.some((e) => e.instancePath === '/key')).toBe(true);
    });

    it('should reject invalid-version.json with invalid version format', () => {
      const fixturePath = join(__dirname, '../../../fixtures/invalid/invalid-version.json');
      const fixture = JSON.parse(readFileSync(fixturePath, 'utf-8'));

      const result = validator.validate(fixture);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.instancePath === '/version')).toBe(true);
    });

    it('should reject missing-fields.json with missing required category', () => {
      const fixturePath = join(__dirname, '../../../fixtures/invalid/missing-fields.json');
      const fixture = JSON.parse(readFileSync(fixturePath, 'utf-8'));

      const result = validator.validate(fixture);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.keyword === 'required')).toBe(true);
    });
  });

  describe('Schema Constraints', () => {
    it('should require snake_case keys', () => {
      const invalid = {
        key: 'InvalidKey',
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
          activity: 'test_algo',
        },
      };

      const result = validator.validate(invalid);
      expect(result.isValid).toBe(false);
    });

    it('should require semantic version format', () => {
      const invalid = {
        key: 'test_algo',
        name: 'Test',
        category: 'Activity',
        summary: 'Test',
        description: 'Test',
        version: 'v1.0',
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
          activity: 'test_algo',
        },
      };

      const result = validator.validate(invalid);
      expect(result.isValid).toBe(false);
    });

    it('should require at least one output', () => {
      const invalid = {
        key: 'test_algo',
        name: 'Test',
        category: 'Activity',
        summary: 'Test',
        description: 'Test',
        version: '1.0.0',
        inputs: [],
        outputs: [],
        runtime: {
          taskQueue: 'typescript-worker',
          activity: 'test_algo',
        },
      };

      const result = validator.validate(invalid);
      expect(result.isValid).toBe(false);
    });

    it('should require csv metadata when type is csv', () => {
      const invalid = {
        key: 'test_algo',
        name: 'Test',
        category: 'Activity',
        summary: 'Test',
        description: 'Test',
        version: '1.0.0',
        inputs: [
          {
            key: 'data',
            type: 'csv',
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
          activity: 'test_algo',
        },
      };

      const result = validator.validate(invalid);
      expect(result.isValid).toBe(false);
    });

    it('should require csv property when type is csv', () => {
      const invalid = {
        key: 'test_algo',
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
          },
        ],
        runtime: {
          taskQueue: 'typescript-worker',
          activity: 'test_algo',
        },
      };

      const result = validator.validate(invalid);
      expect(result.isValid).toBe(false);
    });

    it('should accept valid categories', () => {
      const categories = ['Engagement', 'Activity'];

      for (const category of categories) {
        const valid = {
          key: 'test_algo',
          name: 'Test',
          category,
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
            activity: 'test_algo',
          },
        };

        const result = validator.validate(valid);
        expect(result.isValid).toBe(true);
      }
    });
  });

  describe('Runtime Metadata', () => {
    it('should accept valid runtime metadata', () => {
      const valid = {
        key: 'test_algo',
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
          activity: 'test_algo',
        },
      };

      const result = validator.validate(valid);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject algorithm without runtime metadata (required)', () => {
      const invalid = {
        key: 'test_algo',
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
      };

      const result = validator.validate(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.instancePath === '' && e.keyword === 'required')).toBe(true);
    });

    it('should reject runtime metadata with missing taskQueue', () => {
      const invalid = {
        key: 'test_algo',
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
          activity: 'test_algo',
        },
      };

      const result = validator.validate(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.instancePath === '/runtime')).toBe(true);
    });

    it('should reject runtime metadata with missing activity', () => {
      const invalid = {
        key: 'test_algo',
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
        },
      };

      const result = validator.validate(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.instancePath === '/runtime')).toBe(true);
    });

    it('should reject runtime metadata with empty taskQueue', () => {
      const invalid = {
        key: 'test_algo',
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
          taskQueue: '',
          activity: 'test_algo',
        },
      };

      const result = validator.validate(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.instancePath === '/runtime/taskQueue')).toBe(true);
    });

    it('should reject runtime metadata with empty activity', () => {
      const invalid = {
        key: 'test_algo',
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
          activity: '',
        },
      };

      const result = validator.validate(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.instancePath === '/runtime/activity')).toBe(true);
    });

    it('should reject runtime metadata with additional properties', () => {
      const invalid = {
        key: 'test_algo',
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
          activity: 'test_algo',
          extraProperty: 'not allowed',
        },
      };

      const result = validator.validate(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.keyword === 'additionalProperties')).toBe(true);
    });

    it('should accept different taskQueue values', () => {
      const taskQueues = ['typescript-worker', 'python-worker', 'reputation-algorithms-heavy', 'custom-queue'];

      for (const taskQueue of taskQueues) {
        const valid = {
          key: 'test_algo',
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
            taskQueue,
            activity: 'test_algo',
          },
        };

        const result = validator.validate(valid);
        expect(result.isValid).toBe(true);
      }
    });
  });
});
