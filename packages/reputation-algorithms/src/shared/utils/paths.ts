import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function getModuleFileAndDir(importMetaUrl: string): {
  filename: string;
  dirname: string;
} {
  const filename = fileURLToPath(importMetaUrl);
  const dir = dirname(filename);
  return { filename, dirname: dir };
}

export function resolveRegistryPath(moduleDir: string, configuredPath?: string): string {
  return configuredPath ?? process.env['REPUTO_REGISTRY_PATH'] ?? join(moduleDir, '../registry');
}

export function resolveRegistryIndexPath(moduleDir: string, configuredPath?: string): string {
  return configuredPath ?? process.env['REPUTO_REGISTRY_INDEX_PATH'] ?? join(moduleDir, '../registry/index.gen.ts');
}
