import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { AlgorithmVersion, RegistryIndex } from '../types/registry.js';

/**
 * Scans the registry directory structure to discover algorithm definitions
 *
 * Expected structure:
 * registry/
 *   ├── algorithm-key-1/
 *   │   ├── 1.0.0.json
 *   │   └── 1.1.0.json
 *   └── algorithm-key-2/
 *       └── 2.0.0.json
 */
export function scanRegistryDirectory(registryPath: string): RegistryIndex {
  const algorithmMap = new Map<string, AlgorithmVersion[]>();
  let totalVersions = 0;

  try {
    const entries = readdirSync(registryPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const key = entry.name;
      const keyPath = join(registryPath, key);

      const versions = scanAlgorithmVersions(keyPath, key);
      if (versions.length > 0) {
        algorithmMap.set(key, versions);
        totalVersions += versions.length;
      }
    }
  } catch (error) {
    throw new Error(`Failed to scan registry directory: ${error instanceof Error ? error.message : String(error)}`);
  }

  return {
    algorithms: algorithmMap,
    totalAlgorithms: algorithmMap.size,
    totalVersions,
  };
}

/**
 * Scans version files within an algorithm directory
 */
function scanAlgorithmVersions(keyPath: string, key: string): AlgorithmVersion[] {
  const versions: AlgorithmVersion[] = [];

  try {
    const versionFiles = readdirSync(keyPath, { withFileTypes: true });

    for (const versionFile of versionFiles) {
      if (!versionFile.isFile() || !versionFile.name.endsWith('.json')) {
        continue;
      }

      const version = versionFile.name.replace('.json', '');
      const filePath = join(keyPath, versionFile.name);

      versions.push({ key, version, filePath });
    }
  } catch (error) {
    console.warn(
      `Warning: Could not scan versions for algorithm '${key}': ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return versions;
}
