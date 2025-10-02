import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import {
  DuplicateError,
  KeyMismatchError,
  ValidationError,
  type ValidationErrorDetail,
  VersionMismatchError,
} from '../api/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface RegistryEntry {
  key: string;
  version: string;
  filePath: string;
  content: unknown;
}

function createValidator(): Ajv {
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: true,
    validateFormats: true,
  });

  addFormats(ajv);

  const schemaPath = join(__dirname, '../schema/algorithm-definition.schema.json');
  const schemaContent = readFileSync(schemaPath, 'utf-8');
  const schema = JSON.parse(schemaContent);

  ajv.addSchema(schema, 'algorithm-definition');

  return ajv;
}

function scanRegistryFiles(registryPath: string): RegistryEntry[] {
  const entries: RegistryEntry[] = [];
  const directories = readdirSync(registryPath, { withFileTypes: true });

  for (const dir of directories) {
    if (!dir.isDirectory()) continue;

    const folderKey = dir.name;
    const keyPath = join(registryPath, folderKey);
    const files = readdirSync(keyPath, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith('.json')) continue;

      const filenameVersion = file.name.replace('.json', '');
      const filePath = join(keyPath, file.name);
      const content = JSON.parse(readFileSync(filePath, 'utf-8'));

      entries.push({
        key: folderKey,
        version: filenameVersion,
        filePath,
        content,
      });
    }
  }

  return entries;
}

function validateEntry(entry: RegistryEntry, validator: Ajv): void {
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

  const validate = validator.getSchema('algorithm-definition');
  if (!validate) {
    throw new Error('Failed to get validator');
  }

  if (!validate(content)) {
    const errors: ValidationErrorDetail[] = (validate.errors || []).map((e) => ({
      instancePath: e.instancePath,
      message: e.message || undefined,
      keyword: e.keyword,
      params: e.params || {},
    }));
    throw new ValidationError(
      filePath,
      errors,
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

function checkDuplicates(entries: RegistryEntry[]): void {
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

function main(): void {
  const registryPath = join(__dirname, '../registry');

  console.log('Validating algorithm registry...');
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

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateEntry, checkDuplicates, scanRegistryFiles };
