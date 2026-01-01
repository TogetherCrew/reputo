import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  checkDuplicates,
  scanRegistryFiles,
  validateEntry,
  validateRegistry,
} from '../../../src/cli/validate-registry.js';
import { createValidatorWithSchema } from '../../../src/shared/utils/validation.js';

const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
};

vi.stubGlobal('console', mockConsole);

const mockExit = vi.fn();
vi.stubGlobal('process', { ...process, exit: mockExit });

describe('CLI: validateRegistry', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `validate-registry-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });

    mockConsole.log.mockClear();
    mockConsole.error.mockClear();
    mockExit.mockClear();
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('scanRegistryFiles', () => {
    it('should scan empty registry', () => {
      const entries = scanRegistryFiles(testDir);
      expect(entries).toEqual([]);
    });

    it('should scan registry with valid algorithms', () => {
      const algoDir = join(testDir, 'test_algorithm');
      mkdirSync(algoDir, { recursive: true });

      const algorithmDef = {
        key: 'test_algorithm',
        name: 'Test Algorithm',
        category: 'Custom',
        description: 'A test algorithm',
        version: '1.0.0',
        inputs: [],
        outputs: [
          {
            key: 'result',
            type: 'score_map',
            entity: 'user',
          },
        ],
        runtime: {
          taskQueue: 'typescript-worker',
          activity: 'test_algorithm',
        },
      };

      const filePath = join(algoDir, '1.0.0.json');
      writeFileSync(filePath, JSON.stringify(algorithmDef));

      const entries = scanRegistryFiles(testDir);

      expect(entries).toHaveLength(1);
      expect(entries[0]).toMatchObject({
        key: 'test_algorithm',
        version: '1.0.0',
        filePath,
        content: algorithmDef,
      });
    });

    it('should scan multiple algorithms and versions', () => {
      const algorithms = [
        { key: 'algo1', versions: ['1.0.0', '1.1.0'] },
        { key: 'algo2', versions: ['2.0.0'] },
      ];

      for (const algo of algorithms) {
        const algoDir = join(testDir, algo.key);
        mkdirSync(algoDir, { recursive: true });

        for (const version of algo.versions) {
          const algorithmDef = {
            key: algo.key,
            version,
            name: algo.key,
            category: 'Custom',
            description: 'Test',
            inputs: [],
            outputs: [
              {
                key: 'result',
                type: 'score_map',
                entity: 'user',
              },
            ],
            runtime: {
              taskQueue: 'typescript-worker',
              activity: algo.key,
            },
          };

          writeFileSync(join(algoDir, `${version}.json`), JSON.stringify(algorithmDef));
        }
      }

      const entries = scanRegistryFiles(testDir);
      expect(entries).toHaveLength(3);

      const keys = entries.map((e) => e.key);
      expect(keys).toContain('algo1');
      expect(keys).toContain('algo2');
    });
  });

  describe('validateEntry', () => {
    let validator: ReturnType<typeof createValidatorWithSchema>;

    beforeEach(() => {
      validator = createValidatorWithSchema();
    });

    it('should validate correct entry', () => {
      const entry = {
        key: 'test_algorithm',
        version: '1.0.0',
        filePath: '/test/test_algorithm/1.0.0.json',
        content: {
          key: 'test_algorithm',
          name: 'Test Algorithm',
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
            activity: 'test_algorithm',
          },
        },
      };

      expect(() => validateEntry(entry, validator)).not.toThrow();
    });

    it('should throw ValidationError for invalid schema', () => {
      const entry = {
        key: 'test_algorithm',
        version: '1.0.0',
        filePath: '/test/test_algorithm/1.0.0.json',
        content: {
          key: 'test_algorithm',
        },
      };

      expect(() => validateEntry(entry, validator)).toThrow();
    });

    it('should throw KeyMismatchError for folder/content key mismatch', () => {
      const entry = {
        key: 'folder_key',
        version: '1.0.0',
        filePath: '/test/folder_key/1.0.0.json',
        content: {
          key: 'content_key',
          name: 'Test',
          category: 'Custom',
          description: 'Test',
          version: '1.0.0',
          inputs: [],
          outputs: [{ key: 'result', type: 'score_map', entity: 'user' }],
        },
      };

      expect(() => validateEntry(entry, validator)).toThrow();
    });

    it('should throw VersionMismatchError for filename/content version mismatch', () => {
      const entry = {
        key: 'test_algorithm',
        version: '1.0.0',
        filePath: '/test/test_algorithm/1.0.0.json',
        content: {
          key: 'test_algorithm',
          name: 'Test',
          category: 'Custom',
          description: 'Test',
          version: '2.0.0',
          inputs: [],
          outputs: [{ key: 'result', type: 'score_map', entity: 'user' }],
        },
      };

      expect(() => validateEntry(entry, validator)).toThrow();
    });

    it('should throw ValidationError for non-object content', () => {
      const entry = {
        key: 'test_algorithm',
        version: '1.0.0',
        filePath: '/test/test_algorithm/1.0.0.json',
        content: 'not an object',
      };

      expect(() => validateEntry(entry, validator)).toThrow();
    });

    it('should throw ValidationError for null content', () => {
      const entry = {
        key: 'test_algorithm',
        version: '1.0.0',
        filePath: '/test/test_algorithm/1.0.0.json',
        content: null,
      };

      expect(() => validateEntry(entry, validator)).toThrow();
    });
  });

  describe('checkDuplicates', () => {
    it('should pass for unique entries', () => {
      const entries = [
        {
          key: 'algo1',
          version: '1.0.0',
          filePath: '/test/algo1/1.0.0.json',
          content: { key: 'algo1', version: '1.0.0' },
        },
        {
          key: 'algo1',
          version: '2.0.0',
          filePath: '/test/algo1/2.0.0.json',
          content: { key: 'algo1', version: '2.0.0' },
        },
        {
          key: 'algo2',
          version: '1.0.0',
          filePath: '/test/algo2/1.0.0.json',
          content: { key: 'algo2', version: '1.0.0' },
        },
      ];

      expect(() => checkDuplicates(entries)).not.toThrow();
    });

    it('should throw DuplicateError for duplicate key@version', () => {
      const entries = [
        {
          key: 'algo1',
          version: '1.0.0',
          filePath: '/test/algo1/1.0.0.json',
          content: { key: 'algo1', version: '1.0.0' },
        },
        {
          key: 'algo1',
          version: '1.0.0',
          filePath: '/test/duplicate/1.0.0.json',
          content: { key: 'algo1', version: '1.0.0' },
        },
      ];

      expect(() => checkDuplicates(entries)).toThrow();
    });

    it('should skip entries with invalid content', () => {
      const entries = [
        {
          key: 'algo1',
          version: '1.0.0',
          filePath: '/test/algo1/1.0.0.json',
          content: 'invalid',
        },
        {
          key: 'algo2',
          version: '1.0.0',
          filePath: '/test/algo2/1.0.0.json',
          content: null,
        },
        {
          key: 'algo3',
          version: '1.0.0',
          filePath: '/test/algo3/1.0.0.json',
          content: { key: 'algo3', version: '1.0.0' },
        },
      ];

      expect(() => checkDuplicates(entries)).not.toThrow();
    });

    it('should skip entries with missing key or version', () => {
      const entries = [
        {
          key: 'algo1',
          version: '1.0.0',
          filePath: '/test/algo1/1.0.0.json',
          content: { version: '1.0.0' },
        },
        {
          key: 'algo2',
          version: '1.0.0',
          filePath: '/test/algo2/1.0.0.json',
          content: { key: 'algo2' },
        },
        {
          key: 'algo3',
          version: '1.0.0',
          filePath: '/test/algo3/1.0.0.json',
          content: { key: 'algo3', version: '1.0.0' },
        },
      ];

      expect(() => checkDuplicates(entries)).not.toThrow();
    });
  });

  describe('validateRegistry', () => {
    it('should validate empty registry', () => {
      expect(() => validateRegistry(testDir)).not.toThrow();
    });

    it('should validate registry with correct algorithms', () => {
      const algoDir = join(testDir, 'test_algorithm');
      mkdirSync(algoDir, { recursive: true });

      const algorithmDef = {
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

      writeFileSync(join(algoDir, '1.0.0.json'), JSON.stringify(algorithmDef));

      expect(() => validateRegistry(testDir)).not.toThrow();
    });

    it('should throw for invalid algorithm schema', () => {
      const algoDir = join(testDir, 'invalid_algorithm');
      mkdirSync(algoDir, { recursive: true });

      const invalidDef = {
        key: 'InvalidKey',
      };

      writeFileSync(join(algoDir, '1.0.0.json'), JSON.stringify(invalidDef));

      expect(() => validateRegistry(testDir)).toThrow();
    });

    it('should throw for key mismatch', () => {
      const algoDir = join(testDir, 'folder_name');
      mkdirSync(algoDir, { recursive: true });

      const mismatchDef = {
        key: 'content_name',
        name: 'Test',
        category: 'Custom',
        description: 'Test',
        version: '1.0.0',
        inputs: [],
        outputs: [{ key: 'result', type: 'score_map', entity: 'user' }],
      };

      writeFileSync(join(algoDir, '1.0.0.json'), JSON.stringify(mismatchDef));

      expect(() => validateRegistry(testDir)).toThrow();
    });

    it('should throw for version mismatch', () => {
      const algoDir = join(testDir, 'test_algorithm');
      mkdirSync(algoDir, { recursive: true });

      const mismatchDef = {
        key: 'test_algorithm',
        name: 'Test',
        category: 'Custom',
        description: 'Test',
        version: '2.0.0',
        inputs: [],
        outputs: [{ key: 'result', type: 'score_map', entity: 'user' }],
      };

      writeFileSync(join(algoDir, '1.0.0.json'), JSON.stringify(mismatchDef));

      expect(() => validateRegistry(testDir)).toThrow();
    });

    it('should throw for duplicate algorithms', () => {
      const algoDir1 = join(testDir, 'test_algorithm');
      const algoDir2 = join(testDir, 'duplicate_algorithm');
      mkdirSync(algoDir1, { recursive: true });
      mkdirSync(algoDir2, { recursive: true });

      const algorithmDef = {
        key: 'test_algorithm',
        name: 'Test Algorithm',
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
          activity: 'test_algorithm',
        },
      };

      writeFileSync(join(algoDir1, '1.0.0.json'), JSON.stringify(algorithmDef));

      writeFileSync(join(algoDir2, '1.0.0.json'), JSON.stringify(algorithmDef));

      expect(() => validateRegistry(testDir)).toThrow();
    });

    it('should validate multiple correct algorithms', () => {
      const algorithms = [
        { key: 'user_activity', version: '1.0.0' },
        { key: 'voting_engagement', version: '1.0.0' },
        { key: 'content_quality', version: '2.0.0' },
      ];

      for (const algo of algorithms) {
        const algoDir = join(testDir, algo.key);
        mkdirSync(algoDir, { recursive: true });

        const algorithmDef = {
          key: algo.key,
          name: algo.key.replace(/_/g, ' '),
          category: 'Activity',
          summary: 'Test algorithm',
          description: 'Test algorithm',
          version: algo.version,
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
            activity: algo.key,
          },
        };

        writeFileSync(join(algoDir, `${algo.version}.json`), JSON.stringify(algorithmDef));
      }

      expect(() => validateRegistry(testDir)).not.toThrow();
    });
  });
});
