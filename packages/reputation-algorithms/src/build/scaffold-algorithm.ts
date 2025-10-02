import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface AlgorithmTemplate {
  key: string;
  name: string;
  category: 'engagement' | 'quality' | 'activity' | 'custom';
  description: string;
  version: string;
  inputs: unknown[];
  outputs: unknown[];
}

function validateKey(key: string): boolean {
  const pattern = /^[a-z][a-z0-9_]*$/;
  return pattern.test(key) && key.length >= 2;
}

function validateVersion(version: string): boolean {
  const pattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/;
  return pattern.test(version);
}

function createTemplate(key: string, version: string): AlgorithmTemplate {
  const name = key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    key,
    name,
    category: 'custom',
    description: 'TODO: Add algorithm description',
    version,
    inputs: [
      {
        key: 'input_data',
        label: 'Input Data',
        description: 'TODO: Describe input data',
        type: 'csv',
        csv: {
          hasHeader: true,
          delimiter: ',',
          columns: [
            {
              key: 'example_column',
              type: 'string',
              description: 'TODO: Describe column',
            },
          ],
        },
      },
    ],
    outputs: [
      {
        key: 'result',
        label: 'Result',
        type: 'score_map',
        entity: 'user',
        description: 'TODO: Describe output',
      },
    ],
  };
}

function scaffoldAlgorithm(key: string, version: string): void {
  if (!validateKey(key)) {
    console.error('✗ Invalid key format');
    console.error('  Key must be snake_case, start with a letter, and be at least 2 characters long');
    console.error(`  Examples: user_activity, voting_power, content_quality`);
    process.exit(1);
  }

  if (!validateVersion(version)) {
    console.error('✗ Invalid version format');
    console.error('  Version must be a valid semantic version (e.g., 1.0.0, 2.1.3-beta, 3.0.0+build.123)');
    process.exit(1);
  }

  const registryPath = join(__dirname, '../registry');
  const keyDir = join(registryPath, key);
  const filePath = join(keyDir, `${version}.json`);

  if (existsSync(filePath)) {
    console.error(`✗ File already exists: ${filePath}`);
    console.error('  Use a different version or remove the existing file');
    process.exit(1);
  }

  mkdirSync(keyDir, { recursive: true });

  const template = createTemplate(key, version);
  const content = JSON.stringify(template, null, 4);

  writeFileSync(filePath, `${content}\n`, 'utf-8');

  console.log('✓ Algorithm definition created successfully!');
  console.log('');
  console.log(`  File: ${filePath}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Edit the JSON file to define your algorithm');
  console.log('  2. Update the category, description, inputs, and outputs');
  console.log('  3. Run: pnpm test:algorithms');
  console.log('  4. Run: pnpm gen:registry');
  console.log('');
}

function printUsage(): void {
  console.log('Usage: pnpm algorithm:new <key> <version>');
  console.log('');
  console.log('Arguments:');
  console.log('  key      Algorithm key in snake_case (e.g., voting_engagement)');
  console.log('  version  Semantic version (e.g., 1.0.0)');
  console.log('');
  console.log('Examples:');
  console.log('  pnpm algorithm:new user_activity 1.0.0');
  console.log('  pnpm algorithm:new voting_power 2.1.0');
  console.log('  pnpm algorithm:new content_quality 1.0.0-beta');
  console.log('');
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  if (args.length !== 2) {
    console.error('✗ Invalid arguments');
    console.error('');
    printUsage();
    process.exit(1);
  }

  const [key, version] = args;

  if (!key || !version) {
    console.error('✗ Both key and version are required');
    console.error('');
    printUsage();
    process.exit(1);
  }

  scaffoldAlgorithm(key, version);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { scaffoldAlgorithm, validateKey, validateVersion };
