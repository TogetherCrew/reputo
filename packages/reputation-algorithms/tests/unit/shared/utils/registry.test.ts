import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  generateRegistryIndexContent,
  generateRegistryStats,
  scanRegistryDirectory,
} from '../../../../src/shared/utils/registry.js';

describe('Registry Utils', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `registry-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('scanRegistryDirectory', () => {
    it('should scan empty directory', () => {
      const result = scanRegistryDirectory(testDir);

      expect(result.algorithms.size).toBe(0);
      expect(result.totalAlgorithms).toBe(0);
      expect(result.totalVersions).toBe(0);
    });

    it('should scan directory with algorithms', () => {
      const algoDir = join(testDir, 'test_algorithm');
      mkdirSync(algoDir, { recursive: true });

      writeFileSync(
        join(algoDir, '1.0.0.json'),
        JSON.stringify({
          key: 'test_algorithm',
          version: '1.0.0',
          name: 'Test Algorithm',
          category: 'custom',
          description: 'Test',
          inputs: [],
          outputs: [{ key: 'result', type: 'score_map', entity: 'user' }],
        }),
      );

      writeFileSync(
        join(algoDir, '1.1.0.json'),
        JSON.stringify({
          key: 'test_algorithm',
          version: '1.1.0',
          name: 'Test Algorithm',
          category: 'custom',
          description: 'Test',
          inputs: [],
          outputs: [{ key: 'result', type: 'score_map', entity: 'user' }],
        }),
      );

      const result = scanRegistryDirectory(testDir);

      expect(result.algorithms.size).toBe(1);
      expect(result.totalAlgorithms).toBe(1);
      expect(result.totalVersions).toBe(2);

      const algorithm = result.algorithms.get('test_algorithm');
      expect(algorithm).toBeDefined();
      expect(algorithm?.length).toBe(2);
      expect(algorithm?.map((v) => v.version)).toEqual(['1.0.0', '1.1.0']);
    });

    it('should ignore non-JSON files', () => {
      const algoDir = join(testDir, 'test_algorithm');
      mkdirSync(algoDir, { recursive: true });

      writeFileSync(
        join(algoDir, '1.0.0.json'),
        JSON.stringify({
          key: 'test_algorithm',
          version: '1.0.0',
        }),
      );

      writeFileSync(join(algoDir, 'README.md'), '# Test');
      writeFileSync(join(algoDir, 'config.txt'), 'config');
      writeFileSync(join(algoDir, 'script.js'), 'console.log("test")');

      const result = scanRegistryDirectory(testDir);

      expect(result.totalVersions).toBe(1);
      const algorithm = result.algorithms.get('test_algorithm');
      expect(algorithm?.length).toBe(1);
    });

    it('should handle multiple algorithms', () => {
      const algorithms = ['user_activity', 'voting_engagement', 'content_quality'];

      for (const algoKey of algorithms) {
        const algoDir = join(testDir, algoKey);
        mkdirSync(algoDir, { recursive: true });

        writeFileSync(
          join(algoDir, '1.0.0.json'),
          JSON.stringify({
            key: algoKey,
            version: '1.0.0',
          }),
        );
      }

      const result = scanRegistryDirectory(testDir);

      expect(result.algorithms.size).toBe(3);
      expect(result.totalAlgorithms).toBe(3);
      expect(result.totalVersions).toBe(3);

      for (const algoKey of algorithms) {
        expect(result.algorithms.has(algoKey)).toBe(true);
      }
    });

    it('should handle directories without JSON files', () => {
      const algoDir = join(testDir, 'empty_algorithm');
      mkdirSync(algoDir, { recursive: true });
      writeFileSync(join(algoDir, 'README.md'), '# Empty');

      const result = scanRegistryDirectory(testDir);

      expect(result.algorithms.size).toBe(0);
      expect(result.totalAlgorithms).toBe(0);
      expect(result.totalVersions).toBe(0);
    });

    it('should throw error for non-existent directory', () => {
      const nonExistentDir = join(testDir, 'does-not-exist');

      expect(() => {
        scanRegistryDirectory(nonExistentDir);
      }).toThrow();
    });
  });

  describe('generateRegistryIndexContent', () => {
    it('should generate content for empty registry', () => {
      const registryIndex = {
        algorithms: new Map(),
        totalAlgorithms: 0,
        totalVersions: 0,
      };

      const content = generateRegistryIndexContent(registryIndex);

      expect(content).toContain('// This file is auto-generated');
      expect(content).toContain('export const REGISTRY_INDEX = {');
      expect(content).toContain('} as const;');
      expect(content).toContain('export const _DEFINITIONS: Record<string, unknown> = {');
    });

    it('should generate content for registry with algorithms', () => {
      const registryIndex = {
        algorithms: new Map([
          [
            'test_algorithm',
            [
              {
                key: 'test_algorithm',
                version: '1.0.0',
                filePath: '/path/1.0.0.json',
              },
              {
                key: 'test_algorithm',
                version: '2.0.0',
                filePath: '/path/2.0.0.json',
              },
            ],
          ],
          [
            'another_algorithm',
            [
              {
                key: 'another_algorithm',
                version: '1.0.0',
                filePath: '/path2/1.0.0.json',
              },
            ],
          ],
        ]),
        totalAlgorithms: 2,
        totalVersions: 3,
      };

      const content = generateRegistryIndexContent(registryIndex);

      expect(content).toContain('another_algorithm: [');
      expect(content).toContain('test_algorithm: [');

      expect(content).toContain("'1.0.0', '2.0.0'");

      expect(content).toContain('import _another_algorithm_1_0_0 from');
      expect(content).toContain('import _test_algorithm_1_0_0 from');
      expect(content).toContain('import _test_algorithm_2_0_0 from');

      expect(content).toContain("'another_algorithm@1.0.0': _another_algorithm_1_0_0");
      expect(content).toContain("'test_algorithm@1.0.0': _test_algorithm_1_0_0");
      expect(content).toContain("'test_algorithm@2.0.0': _test_algorithm_2_0_0");
    });

    it('should sort algorithms alphabetically', () => {
      const registryIndex = {
        algorithms: new Map([
          [
            'zebra_algorithm',
            [
              {
                key: 'zebra_algorithm',
                version: '1.0.0',
                filePath: '/path/1.0.0.json',
              },
            ],
          ],
          [
            'alpha_algorithm',
            [
              {
                key: 'alpha_algorithm',
                version: '1.0.0',
                filePath: '/path/1.0.0.json',
              },
            ],
          ],
        ]),
        totalAlgorithms: 2,
        totalVersions: 2,
      };

      const content = generateRegistryIndexContent(registryIndex);

      const alphaIndex = content.indexOf('alpha_algorithm:');
      const zebraIndex = content.indexOf('zebra_algorithm:');
      expect(alphaIndex).toBeLessThan(zebraIndex);
    });

    it('should sort versions using semantic versioning', () => {
      const registryIndex = {
        algorithms: new Map([
          [
            'test_algorithm',
            [
              {
                key: 'test_algorithm',
                version: '2.0.0',
                filePath: '/path/2.0.0.json',
              },
              {
                key: 'test_algorithm',
                version: '1.0.0',
                filePath: '/path/1.0.0.json',
              },
              {
                key: 'test_algorithm',
                version: '1.1.0',
                filePath: '/path/1.1.0.json',
              },
            ],
          ],
        ]),
        totalAlgorithms: 1,
        totalVersions: 3,
      };

      const content = generateRegistryIndexContent(registryIndex);

      expect(content).toContain("test_algorithm: ['1.0.0', '1.1.0', '2.0.0']");
    });

    it('should sanitize import names', () => {
      const registryIndex = {
        algorithms: new Map([
          [
            'test-algorithm',
            [
              {
                key: 'test-algorithm',
                version: '1.0.0-beta',
                filePath: '/path/1.0.0-beta.json',
              },
            ],
          ],
        ]),
        totalAlgorithms: 1,
        totalVersions: 1,
      };

      const content = generateRegistryIndexContent(registryIndex);

      expect(content).toContain('import _test_algorithm_1_0_0_beta from');
    });
  });

  describe('generateRegistryStats', () => {
    it('should generate stats for empty registry', () => {
      const registryIndex = {
        algorithms: new Map(),
        totalAlgorithms: 0,
        totalVersions: 0,
      };

      const stats = generateRegistryStats(registryIndex);

      expect(stats).toContain('Found 0 algorithm(s) with 0 total version(s)');
    });

    it('should generate stats for registry with algorithms', () => {
      const registryIndex = {
        algorithms: new Map([
          [
            'test_algorithm',
            [
              {
                key: 'test_algorithm',
                version: '1.0.0',
                filePath: '/path/1.0.0.json',
              },
              {
                key: 'test_algorithm',
                version: '2.0.0',
                filePath: '/path/2.0.0.json',
              },
            ],
          ],
          [
            'another_algorithm',
            [
              {
                key: 'another_algorithm',
                version: '1.0.0',
                filePath: '/path2/1.0.0.json',
              },
            ],
          ],
        ]),
        totalAlgorithms: 2,
        totalVersions: 3,
      };

      const stats = generateRegistryStats(registryIndex);

      expect(stats).toContain('Found 2 algorithm(s) with 3 total version(s)');
      expect(stats).toContain('- test_algorithm: 2 version(s) [1.0.0, 2.0.0]');
      expect(stats).toContain('- another_algorithm: 1 version(s) [1.0.0]');
    });

    it('should sort versions in stats output', () => {
      const registryIndex = {
        algorithms: new Map([
          [
            'test_algorithm',
            [
              {
                key: 'test_algorithm',
                version: '2.0.0',
                filePath: '/path/2.0.0.json',
              },
              {
                key: 'test_algorithm',
                version: '1.0.0',
                filePath: '/path/1.0.0.json',
              },
              {
                key: 'test_algorithm',
                version: '1.1.0',
                filePath: '/path/1.1.0.json',
              },
            ],
          ],
        ]),
        totalAlgorithms: 1,
        totalVersions: 3,
      };

      const stats = generateRegistryStats(registryIndex);

      expect(stats).toContain('[1.0.0, 1.1.0, 2.0.0]');
    });
  });
});
