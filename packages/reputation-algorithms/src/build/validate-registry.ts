/* eslint-disable no-console */
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';
import type { ErrorObject } from 'ajv';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import fg from 'fast-glob';

type Issue = {
  filePath: string;
  message: string;
};

function formatAjvErrors(errors: readonly ErrorObject[] | null | undefined): string {
  if (!errors?.length) return 'Unknown validation error';
  return errors
    .map((e) => {
      const where = e.instancePath || '/';
      const msg = e.message ?? 'invalid';
      const params = e.params && Object.keys(e.params).length ? ` ${JSON.stringify(e.params)}` : '';
      return `• ${where} ${msg}${params}`;
    })
    .join('\n');
}

async function main() {
  // Load schema (internal-only)
  const schemaPath = path.resolve('src/schema/algorithm-definition.schema.json');
  const schema = JSON.parse(await readFile(schemaPath, 'utf8'));

  // Ajv 2020-12 to match your schema draft
  const ajv = new Ajv({
    strict: true,
    allErrors: true,
  });
  addFormats(ajv);

  const validate = ajv.compile(schema);

  // Discover all registry JSON files
  const files = await fg('src/registry/*/*.json', {
    dot: false,
    absolute: true,
  });

  const issues: Issue[] = [];

  for (const abs of files) {
    const rel = path.relative(process.cwd(), abs);
    const json = JSON.parse(await readFile(abs, 'utf8')) as unknown;

    // Validate against schema
    const ok = validate(json);
    if (!ok) {
      issues.push({
        filePath: rel,
        message: `Schema validation failed:\n${formatAjvErrors(validate.errors)}`,
      });
      continue;
    }

    // Invariants: filename vs content
    const versionFromFile = path.parse(abs).name; // e.g., "1.0.0"
    const keyFromDir = path.basename(path.dirname(abs)); // e.g., "voting_engagement"

    // Narrow the JSON in a no-`any` way using index signatures + runtime checks
    const obj = json as Readonly<Record<string, unknown>>;
    const keyVal = obj['key'];
    const versionVal = obj['version'];

    if (typeof keyVal !== 'string' || typeof versionVal !== 'string') {
      issues.push({
        filePath: rel,
        message: 'Internal invariant failed: after schema validation, "key" and "version" must be strings.',
      });
      continue;
    }

    const key = keyVal;
    const version = versionVal;

    if (key !== keyFromDir) {
      issues.push({
        filePath: rel,
        message: `KeyMismatchError: filename key "${keyFromDir}" != content key "${key}"`,
      });
    }
    if (version !== versionFromFile) {
      issues.push({
        filePath: rel,
        message: `VersionMismatchError: filename version "${versionFromFile}" != content version "${version}"`,
      });
    }
  }

  if (issues.length) {
    console.error('\n❌ Registry validation failed with issues:\n');
    for (const i of issues) {
      console.error(`- ${i.filePath}\n  ${i.message}\n`);
    }
    process.exitCode = 1;
  } else {
    console.log(`✅ Validated ${files.length} definition${files.length === 1 ? '' : 's'} with no issues.`);
  }
}

main().catch((err) => {
  console.error('validate-registry crashed:', err);
  process.exitCode = 1;
});
