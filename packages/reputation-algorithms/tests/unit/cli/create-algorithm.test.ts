import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAlgorithm } from '../../../src/cli/create-algorithm.js';

const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
};

vi.stubGlobal('console', mockConsole);

const mockExit = vi.fn();
vi.stubGlobal('process', { ...process, exit: mockExit });

describe('CLI: createAlgorithm', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `create-algorithm-test-${Date.now()}`);
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

  describe('valid inputs', () => {
    it('should create algorithm with valid key and version', () => {
      createAlgorithm('test_algorithm', '1.0.0', {
        outputPath: testDir,
      });

      const expectedPath = join(testDir, 'test_algorithm', '1.0.0.json');
      expect(existsSync(expectedPath)).toBe(true);

      const content = JSON.parse(readFileSync(expectedPath, 'utf-8'));
      expect(content).toMatchObject({
        key: 'test_algorithm',
        name: 'Test Algorithm',
        version: '1.0.0',
        category: 'custom',
        description: 'TODO: Add algorithm description',
      });

      expect(mockConsole.log).toHaveBeenCalledWith('✓ Algorithm definition created successfully!');
    });

    it('should create algorithm with custom config', () => {
      createAlgorithm('voting_engagement', '2.1.0', {
        outputPath: testDir,
        category: 'engagement',
        customDescription: 'Measures user voting engagement',
        includeExampleInput: false,
        includeExampleOutput: true,
      });

      const expectedPath = join(testDir, 'voting_engagement', '2.1.0.json');
      expect(existsSync(expectedPath)).toBe(true);

      const content = JSON.parse(readFileSync(expectedPath, 'utf-8'));
      expect(content).toMatchObject({
        key: 'voting_engagement',
        name: 'Voting Engagement',
        version: '2.1.0',
        category: 'engagement',
        description: 'Measures user voting engagement',
        inputs: [],
        outputs: [
          {
            key: 'result',
            label: 'Result',
            type: 'score_map',
            entity: 'user',
            description: 'TODO: Describe output',
          },
        ],
      });
    });

    it('should create algorithm with prerelease version', () => {
      createAlgorithm('test_algo', '1.0.0-beta.1', {
        outputPath: testDir,
      });

      const expectedPath = join(testDir, 'test_algo', '1.0.0-beta.1.json');
      expect(existsSync(expectedPath)).toBe(true);

      const content = JSON.parse(readFileSync(expectedPath, 'utf-8'));
      expect(content.version).toBe('1.0.0-beta.1');
    });

    it('should create nested directory structure', () => {
      createAlgorithm('deep_nested_algorithm', '1.0.0', {
        outputPath: testDir,
      });

      const expectedDir = join(testDir, 'deep_nested_algorithm');
      const expectedPath = join(expectedDir, '1.0.0.json');

      expect(existsSync(expectedDir)).toBe(true);
      expect(existsSync(expectedPath)).toBe(true);
    });

    it('should overwrite existing file when overwrite is true', () => {
      const key = 'test_algorithm';
      const version = '1.0.0';

      createAlgorithm(key, version, {
        outputPath: testDir,
        customDescription: 'Original description',
      });

      const expectedPath = join(testDir, key, `${version}.json`);
      let content = JSON.parse(readFileSync(expectedPath, 'utf-8'));
      expect(content.description).toBe('Original description');

      mockConsole.log.mockClear();
      mockConsole.error.mockClear();

      createAlgorithm(key, version, {
        outputPath: testDir,
        customDescription: 'Updated description',
        overwrite: true,
      });

      content = JSON.parse(readFileSync(expectedPath, 'utf-8'));
      expect(content.description).toBe('Updated description');
      expect(mockConsole.log).toHaveBeenCalledWith('✓ Algorithm definition created successfully!');
    });

    it('should include proper JSON formatting', () => {
      createAlgorithm('format_test', '1.0.0', {
        outputPath: testDir,
      });

      const expectedPath = join(testDir, 'format_test', '1.0.0.json');
      const rawContent = readFileSync(expectedPath, 'utf-8');

      expect(rawContent).toContain('    "key": "format_test"');
      expect(rawContent).toContain('    "version": "1.0.0"');

      expect(rawContent.endsWith('\n')).toBe(true);

      expect(() => JSON.parse(rawContent)).not.toThrow();
    });
  });

  describe('validation errors', () => {
    it('should reject invalid key format', () => {
      const invalidKeys = ['InvalidKey', 'INVALID_KEY', 'invalid-key', '123invalid', 'invalid key', 'a', ''];

      for (const key of invalidKeys) {
        createAlgorithm(key, '1.0.0', {
          outputPath: testDir,
        });

        expect(mockConsole.error).toHaveBeenCalledWith('✗ Validation failed:');
        expect(mockExit).toHaveBeenCalledWith(1);

        mockConsole.error.mockClear();
        mockExit.mockClear();
      }
    });

    it('should reject invalid version format', () => {
      const invalidVersions = ['v1.0.0', '1.0', '1', '1.0.0.0', '', 'latest'];

      for (const version of invalidVersions) {
        createAlgorithm('test_algorithm', version, {
          outputPath: testDir,
        });

        expect(mockConsole.error).toHaveBeenCalledWith('✗ Validation failed:');
        expect(mockExit).toHaveBeenCalledWith(1);

        mockConsole.error.mockClear();
        mockExit.mockClear();
      }
    });

    it('should show validation examples on error', () => {
      createAlgorithm('InvalidKey', '1.0.0', {
        outputPath: testDir,
      });

      expect(mockConsole.error).toHaveBeenCalledWith(
        'Examples: voting_engagement, proposal_engagement, contribution_engagement',
      );
    });

    it('should reject when file already exists and overwrite is false', () => {
      const key = 'existing_algorithm';
      const version = '1.0.0';

      createAlgorithm(key, version, {
        outputPath: testDir,
      });

      mockConsole.log.mockClear();
      mockConsole.error.mockClear();
      mockExit.mockClear();

      createAlgorithm(key, version, {
        outputPath: testDir,
        overwrite: false,
      });

      const expectedPath = join(testDir, key, `${version}.json`);
      expect(mockConsole.error).toHaveBeenCalledWith(`✗ File already exists: ${expectedPath}`);
      expect(mockConsole.error).toHaveBeenCalledWith(
        '  Use a different version, remove the existing file, or set overwrite: true',
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should reject when file already exists and overwrite is not specified', () => {
      const key = 'existing_algorithm';
      const version = '1.0.0';

      createAlgorithm(key, version, {
        outputPath: testDir,
      });

      mockConsole.log.mockClear();
      mockConsole.error.mockClear();
      mockExit.mockClear();

      createAlgorithm(key, version, {
        outputPath: testDir,
      });

      expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('✗ File already exists:'));
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('output messages', () => {
    it('should display helpful next steps', () => {
      createAlgorithm('test_algorithm', '1.0.0', {
        outputPath: testDir,
      });

      expect(mockConsole.log).toHaveBeenCalledWith('Next steps:');
      expect(mockConsole.log).toHaveBeenCalledWith('  1. Edit the JSON file to define your algorithm');
      expect(mockConsole.log).toHaveBeenCalledWith('  2. Update the category, description, inputs, and outputs');
      expect(mockConsole.log).toHaveBeenCalledWith('  3. Run: pnpm registry:validate');
      expect(mockConsole.log).toHaveBeenCalledWith('  4. Run: pnpm build');
    });

    it('should display file path', () => {
      createAlgorithm('test_algorithm', '1.0.0', {
        outputPath: testDir,
      });

      const expectedPath = join(testDir, 'test_algorithm', '1.0.0.json');
      expect(mockConsole.log).toHaveBeenCalledWith(`  File: ${expectedPath}`);
    });
  });

  describe('edge cases', () => {
    it('should handle algorithm keys with numbers', () => {
      createAlgorithm('algorithm_v2', '1.0.0', {
        outputPath: testDir,
      });

      const expectedPath = join(testDir, 'algorithm_v2', '1.0.0.json');
      expect(existsSync(expectedPath)).toBe(true);

      const content = JSON.parse(readFileSync(expectedPath, 'utf-8'));
      expect(content.key).toBe('algorithm_v2');
      expect(content.name).toBe('Algorithm V2');
    });

    it('should handle complex semantic versions', () => {
      const complexVersions = ['1.0.0-alpha.1', '2.1.0-beta.2+build.123', '3.0.0-rc.1', '10.20.30'];

      for (const version of complexVersions) {
        const key = `test_${version.replace(/[^a-z0-9]/gi, '_')}`;
        createAlgorithm(key, version, {
          outputPath: testDir,
        });

        const expectedPath = join(testDir, key, `${version}.json`);
        expect(existsSync(expectedPath)).toBe(true);

        const content = JSON.parse(readFileSync(expectedPath, 'utf-8'));
        expect(content.version).toBe(version);
      }
    });

    it('should handle minimal config', () => {
      createAlgorithm('minimal_test', '1.0.0', {
        outputPath: testDir,
        includeExampleInput: false,
        includeExampleOutput: false,
      });

      const expectedPath = join(testDir, 'minimal_test', '1.0.0.json');
      const content = JSON.parse(readFileSync(expectedPath, 'utf-8'));

      expect(content.inputs).toEqual([]);
      expect(content.outputs).toEqual([]);
    });
  });
});
