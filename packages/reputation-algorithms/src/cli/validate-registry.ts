import { readFileSync } from 'node:fs';

import { DuplicateError, KeyMismatchError, ValidationError, VersionMismatchError } from '../shared/errors/index.js';
import { getModuleFileAndDir, resolveRegistryPath } from '../shared/utils/paths';
import { scanRegistryDirectory } from '../shared/utils/registry-scanner';
import { createValidatorWithSchema } from '../shared/utils/schemaValidator';

const { dirname: __dirname } = getModuleFileAndDir(import.meta.url);

interface RegistryEntry {
  key: string;
  version: string;
  filePath: string;
  content: unknown;
}

function createValidator(): ReturnType<typeof createValidatorWithSchema> {
  return createValidatorWithSchema();
}

export function scanRegistryFiles(registryPath: string): RegistryEntry[] {
  const entries: RegistryEntry[] = [];
  const index = scanRegistryDirectory(registryPath);

  for (const [key, versions] of index.algorithms) {
    for (const { version, filePath } of versions) {
      const content = JSON.parse(readFileSync(filePath, 'utf-8'));
      entries.push({ key, version, filePath, content });
    }
  }

  return entries;
}

export function validateEntry(entry: RegistryEntry, validator: ReturnType<typeof createValidator>): void {
  const { key: folderKey, version: filenameVersion, filePath, content } = entry;

  if (typeof content !== 'object' || content === null) {
    throw new ValidationError(filePath, [
      {
        instancePath: '/',
        message: 'must be an object',
        keyword: 'type',
        params: { type: 'object' },
      },
    ]);
  }

  const data = content as Record<string, unknown>;
  const result = validator.validate(content);

  if (!result.isValid) {
    throw new ValidationError(
      filePath,
      result.errors,
      data['key'] as string | undefined,
      data['version'] as string | undefined,
    );
  }

  const contentKey = data['key'] as string;
  const contentVersion = data['version'] as string;

  if (folderKey !== contentKey) {
    throw new KeyMismatchError(filePath, folderKey, contentKey, filenameVersion);
  }

  if (filenameVersion !== contentVersion) {
    throw new VersionMismatchError(filePath, filenameVersion, contentVersion, contentKey);
  }
}

export function checkDuplicates(entries: RegistryEntry[]): void {
  const seen = new Map<string, string>();

  for (const entry of entries) {
    if (typeof entry.content !== 'object' || entry.content === null) continue;

    const data = entry.content as Record<string, unknown>;
    const key = data['key'] as string;
    const version = data['version'] as string;

    if (!key || !version) continue;

    const identifier = `${key}@${version}`;
    const existing = seen.get(identifier);

    if (existing) {
      throw new DuplicateError(entry.filePath, key, version);
    }

    seen.set(identifier, entry.filePath);
  }
}

export function validateRegistry(registryPath: string = resolveRegistryPath(__dirname)): void {
  const validator = createValidator();
  const entries = scanRegistryFiles(registryPath);

  for (const entry of entries) {
    validateEntry(entry, validator);
  }

  checkDuplicates(entries);
}

function main(): void {
  const registryPath = resolveRegistryPath(__dirname);

  console.log('🔎 Validating algorithm registry...');
  console.log(`Registry path: ${registryPath}`);
  console.log('');

  try {
    const validator = createValidator();
    const entries = scanRegistryFiles(registryPath);

    console.log(`Found ${entries.length} definition(s)`);
    console.log('');

    console.log('Step 1: Schema validation...');
    for (const entry of entries) {
      validateEntry(entry, validator);
      console.log(`  ✓ ${entry.key}@${entry.version}`);
    }

    console.log('');
    console.log('Step 2: Checking for duplicates...');
    checkDuplicates(entries);
    console.log('  ✓ No duplicates found');

    console.log('');
    console.log('✓ All validations passed!');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('✗ Validation failed:');
    console.error('');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }
    console.error('');
    process.exit(1);
  }
}

main();
