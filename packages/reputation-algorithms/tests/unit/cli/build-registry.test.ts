import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildRegistry } from '../../../src/cli/build-registry.js';

const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
};

vi.stubGlobal('console', mockConsole);

const mockExit = vi.fn();
vi.stubGlobal('process', { ...process, exit: mockExit });

describe('CLI: buildRegistry', () => {
  let testDir: string;
  let registryDir: string;
  let outputPath: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `build-registry-test-${Date.now()}`);
    registryDir = join(testDir, 'registry');
    outputPath = join(testDir, 'index.gen.ts');

    mkdirSync(testDir, { recursive: true });
    mkdirSync(registryDir, { recursive: true });

    mockConsole.log.mockClear();
    mockConsole.error.mockClear();
    mockExit.mockClear();
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should build registry for empty directory', () => {
    buildRegistry({
      registryPath: registryDir,
      outputPath,
    });

    expect(existsSync(outputPath)).toBe(true);
    expect(mockConsole.log).toHaveBeenCalledWith('🔍 Scanning registry directory...');
    expect(mockConsole.log).toHaveBeenCalledWith('📝 Generating registry index...');
    expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('✅ Registry index created'));
  });

  it('should build registry with algorithms', () => {
    const algoDir = join(registryDir, 'test_algorithm');
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
    };

    writeFileSync(join(algoDir, '1.0.0.json'), JSON.stringify(algorithmDef, null, 2));

    buildRegistry({
      registryPath: registryDir,
      outputPath,
    });

    expect(existsSync(outputPath)).toBe(true);

    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringContaining('Found 1 algorithm(s) with 1 total version(s)'),
    );
    expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('- test_algorithm: 1 version(s) [1.0.0]'));
  });

  it('should skip writing when content is unchanged', () => {
    const algoDir = join(registryDir, 'test_algorithm');
    mkdirSync(algoDir, { recursive: true });

    writeFileSync(
      join(algoDir, '1.0.0.json'),
      JSON.stringify({
        key: 'test_algorithm',
        version: '1.0.0',
        name: 'Test',
        category: 'Custom',
        description: 'Test',
        inputs: [],
        outputs: [{ key: 'result', type: 'score_map', entity: 'user' }],
      }),
    );

    buildRegistry({
      registryPath: registryDir,
      outputPath,
      includeMetadata: false,
    });

    expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('✅ Registry index created'));

    mockConsole.log.mockClear();

    buildRegistry({
      registryPath: registryDir,
      outputPath,
      includeMetadata: false,
    });

    expect(mockConsole.log).toHaveBeenCalledWith('ℹ️ Registry index unchanged. Skipping write.');
  });

  it('should update existing registry when content changes', () => {
    const algoDir = join(registryDir, 'test_algorithm');
    mkdirSync(algoDir, { recursive: true });

    writeFileSync(
      join(algoDir, '1.0.0.json'),
      JSON.stringify({
        key: 'test_algorithm',
        version: '1.0.0',
        name: 'Test',
        category: 'Custom',
        description: 'Test',
        inputs: [],
        outputs: [{ key: 'result', type: 'score_map', entity: 'user' }],
      }),
    );

    buildRegistry({
      registryPath: registryDir,
      outputPath,
    });

    expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('✅ Registry index created'));

    writeFileSync(
      join(algoDir, '2.0.0.json'),
      JSON.stringify({
        key: 'test_algorithm',
        version: '2.0.0',
        name: 'Test',
        category: 'Custom',
        description: 'Test',
        inputs: [],
        outputs: [{ key: 'result', type: 'score_map', entity: 'user' }],
      }),
    );

    mockConsole.log.mockClear();

    buildRegistry({
      registryPath: registryDir,
      outputPath,
    });

    expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('✅ Registry index updated'));
  });

  it('should handle multiple algorithms and versions', () => {
    const algorithms = [
      { key: 'user_activity', versions: ['1.0.0', '1.1.0'] },
      { key: 'voting_engagement', versions: ['1.0.0'] },
      { key: 'content_quality', versions: ['2.0.0', '2.1.0', '3.0.0'] },
    ];

    for (const algo of algorithms) {
      const algoDir = join(registryDir, algo.key);
      mkdirSync(algoDir, { recursive: true });

      for (const version of algo.versions) {
        writeFileSync(
          join(algoDir, `${version}.json`),
          JSON.stringify({
            key: algo.key,
            version,
            name: algo.key.replace(/_/g, ' '),
            category: 'Custom',
            description: 'Test algorithm',
            inputs: [],
            outputs: [
              {
                key: 'result',
                type: 'score_map',
                entity: 'user',
              },
            ],
          }),
        );
      }
    }

    buildRegistry({
      registryPath: registryDir,
      outputPath,
    });

    const totalVersions = algorithms.reduce((sum, algo) => sum + algo.versions.length, 0);

    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringContaining(`Found ${algorithms.length} algorithm(s) with ${totalVersions} total version(s)`),
    );
  });

  it('should handle error during scanning', () => {
    const nonExistentDir = join(testDir, 'does-not-exist');

    buildRegistry({
      registryPath: nonExistentDir,
      outputPath,
    });

    expect(mockConsole.error).toHaveBeenCalledWith('❌ Failed to generate registry index:');
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should create output directory if it does not exist', () => {
    const nestedOutputPath = join(testDir, 'nested', 'deep', 'index.gen.ts');

    const algoDir = join(registryDir, 'test_algorithm');
    mkdirSync(algoDir, { recursive: true });

    writeFileSync(
      join(algoDir, '1.0.0.json'),
      JSON.stringify({
        key: 'test_algorithm',
        version: '1.0.0',
        name: 'Test',
        category: 'Custom',
        description: 'Test',
        inputs: [],
        outputs: [{ key: 'result', type: 'score_map', entity: 'user' }],
      }),
    );

    buildRegistry({
      registryPath: registryDir,
      outputPath: nestedOutputPath,
    });

    expect(existsSync(nestedOutputPath)).toBe(true);
  });

  it('should handle includeMetadata option', () => {
    const algoDir = join(registryDir, 'test_algorithm');
    mkdirSync(algoDir, { recursive: true });

    writeFileSync(
      join(algoDir, '1.0.0.json'),
      JSON.stringify({
        key: 'test_algorithm',
        version: '1.0.0',
        name: 'Test',
        category: 'Custom',
        description: 'Test',
        inputs: [],
        outputs: [{ key: 'result', type: 'score_map', entity: 'user' }],
      }),
    );

    buildRegistry({
      registryPath: registryDir,
      outputPath,
      includeMetadata: false,
    });

    expect(existsSync(outputPath)).toBe(true);

    buildRegistry({
      registryPath: registryDir,
      outputPath,
      includeMetadata: true,
    });

    expect(existsSync(outputPath)).toBe(true);
  });
});
