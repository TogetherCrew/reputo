import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  getModuleFileAndDir,
  resolveRegistryIndexPath,
  resolveRegistryPath,
} from '../../../../src/shared/utils/filesystem.js';

describe('Filesystem Utils', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `filesystem-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('getModuleFileAndDir', () => {
    it('should extract filename and dirname from import.meta.url', () => {
      const mockUrl = 'file:///Users/test/project/src/utils/test.js';

      const result = getModuleFileAndDir(mockUrl);

      expect(result.filename).toBe('/Users/test/project/src/utils/test.js');
      expect(result.dirname).toBe('/Users/test/project/src/utils');
    });

    it('should handle Windows-style paths', () => {
      const mockUrl = 'file:///C:/Users/test/project/src/utils/test.js';

      const result = getModuleFileAndDir(mockUrl);

      expect(result.filename).toBe('/C:/Users/test/project/src/utils/test.js');
      expect(result.dirname).toBe('/C:/Users/test/project/src/utils');
    });

    it('should handle URLs with special characters', () => {
      const mockUrl = 'file:///Users/test/my%20project/src/utils/test-file.js';

      const result = getModuleFileAndDir(mockUrl);

      expect(result.filename).toBe('/Users/test/my project/src/utils/test-file.js');
      expect(result.dirname).toBe('/Users/test/my project/src/utils');
    });

    it('should work with actual import.meta.url', () => {
      const currentUrl = import.meta.url;

      const result = getModuleFileAndDir(currentUrl);

      expect(result.filename).toContain('filesystem.test.ts');
      expect(result.dirname).toContain('tests/unit/shared/utils');
      expect(existsSync(result.filename)).toBe(true);
    });
  });

  describe('resolveRegistryPath', () => {
    it('should resolve registry path relative to given directory', () => {
      const baseDir = '/Users/test/project/src/cli';

      const registryPath = resolveRegistryPath(baseDir);

      expect(registryPath).toBe('/Users/test/project/src/registry');
    });

    it('should use custom output path when provided', () => {
      const baseDir = '/Users/test/project/src/cli';
      const customPath = '/custom/registry/path';

      const registryPath = resolveRegistryPath(baseDir, customPath);

      expect(registryPath).toBe(customPath);
    });

    it('should handle nested directory structures', () => {
      const baseDir = '/Users/test/project/src/deep/nested/cli';

      const registryPath = resolveRegistryPath(baseDir);

      expect(registryPath).toBe('/Users/test/project/src/deep/nested/registry');
    });

    it('should handle Windows-style paths', () => {
      const baseDir = 'C:\\Users\\test\\project\\src\\cli';

      const registryPath = resolveRegistryPath(baseDir);

      expect(registryPath).toContain('registry');
    });

    it('should work with relative paths', () => {
      const baseDir = './src/cli';

      const registryPath = resolveRegistryPath(baseDir);

      expect(registryPath).toContain('registry');
    });
  });

  describe('resolveRegistryIndexPath', () => {
    it('should resolve index path relative to given directory', () => {
      const baseDir = '/Users/test/project/src/cli';

      const indexPath = resolveRegistryIndexPath(baseDir);

      expect(indexPath).toBe('/Users/test/project/src/registry/index.gen.ts');
    });

    it('should use custom output path when provided', () => {
      const baseDir = '/Users/test/project/src/cli';
      const customPath = '/custom/index/path.ts';

      const indexPath = resolveRegistryIndexPath(baseDir, customPath);

      expect(indexPath).toBe(customPath);
    });

    it('should handle nested directory structures', () => {
      const baseDir = '/Users/test/project/src/deep/nested/cli';

      const indexPath = resolveRegistryIndexPath(baseDir);

      expect(indexPath).toBe('/Users/test/project/src/deep/nested/registry/index.gen.ts');
    });

    it('should handle Windows-style paths', () => {
      const baseDir = 'C:\\Users\\test\\project\\src\\cli';

      const indexPath = resolveRegistryIndexPath(baseDir);

      expect(indexPath).toContain('registry');
      expect(indexPath).toContain('index.gen.ts');
    });

    it('should work with relative paths', () => {
      const baseDir = './src/cli';

      const indexPath = resolveRegistryIndexPath(baseDir);

      expect(indexPath).toContain('registry');
      expect(indexPath).toContain('index.gen.ts');
    });
  });

  describe('integration with actual file system', () => {
    it('should create valid paths that can be used for file operations', () => {
      const mockCliDir = join(testDir, 'src', 'cli');
      mkdirSync(mockCliDir, { recursive: true });

      const registryPath = resolveRegistryPath(mockCliDir);
      const indexPath = resolveRegistryIndexPath(mockCliDir);

      mkdirSync(registryPath, { recursive: true });

      const algoDir = join(registryPath, 'test_algorithm');
      mkdirSync(algoDir, { recursive: true });

      const testFile = join(algoDir, '1.0.0.json');
      writeFileSync(
        testFile,
        JSON.stringify({
          key: 'test_algorithm',
          version: '1.0.0',
        }),
      );

      expect(existsSync(registryPath)).toBe(true);
      expect(existsSync(testFile)).toBe(true);

      const indexDir = dirname(indexPath);
      mkdirSync(indexDir, { recursive: true });
      writeFileSync(indexPath, '// Generated index');

      expect(existsSync(indexPath)).toBe(true);
    });

    it('should handle complex project structures', () => {
      const projectStructure = [
        'packages/reputation-algorithms/src/cli',
        'packages/reputation-algorithms/src/api',
        'packages/reputation-algorithms/src/shared',
      ];

      for (const dir of projectStructure) {
        mkdirSync(join(testDir, dir), { recursive: true });
      }

      const cliDir = join(testDir, 'packages/reputation-algorithms/src/cli');

      const registryPath = resolveRegistryPath(cliDir);
      const indexPath = resolveRegistryIndexPath(cliDir);

      expect(registryPath).toContain('packages/reputation-algorithms/src/registry');
      expect(indexPath).toContain('packages/reputation-algorithms/src/registry/index.gen.ts');
    });
  });

  describe('edge cases', () => {
    it('should handle empty and root directory paths', () => {
      expect(() => resolveRegistryPath('')).not.toThrow();
      expect(() => resolveRegistryIndexPath('')).not.toThrow();
      expect(() => resolveRegistryPath('/')).not.toThrow();
      expect(() => resolveRegistryIndexPath('/')).not.toThrow();
    });

    it('should handle paths with trailing slashes', () => {
      const baseDir = '/Users/test/project/src/cli/';

      const registryPath = resolveRegistryPath(baseDir);
      const indexPath = resolveRegistryIndexPath(baseDir);

      expect(registryPath).toBe('/Users/test/project/src/registry');
      expect(indexPath).toBe('/Users/test/project/src/registry/index.gen.ts');
    });

    it('should handle paths with double slashes', () => {
      const baseDir = '/Users/test//project/src//cli';

      const registryPath = resolveRegistryPath(baseDir);
      const indexPath = resolveRegistryIndexPath(baseDir);

      expect(registryPath).not.toContain('//');
      expect(indexPath).not.toContain('//');
    });

    it('should handle very deep directory structures', () => {
      const deepDir = '/a/very/deep/directory/structure/that/goes/many/levels/down/src/cli';

      const registryPath = resolveRegistryPath(deepDir);
      const indexPath = resolveRegistryIndexPath(deepDir);

      expect(registryPath).toContain('registry');
      expect(indexPath).toContain('index.gen.ts');
    });
  });
});
