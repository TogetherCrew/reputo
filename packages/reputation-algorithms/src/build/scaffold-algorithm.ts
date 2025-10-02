import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AlgorithmKey, VersionString } from '../api/types.js';
import { createAlgorithmTemplate, type TemplateConfig } from './template-factory.js';
import { validateKeyVersion } from './validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ScaffoldConfig extends TemplateConfig {
  readonly outputPath?: string;
  readonly overwrite?: boolean;
}

function scaffoldAlgorithmImpl(key: AlgorithmKey, version: VersionString, config: ScaffoldConfig = {}): void {
  const validation = validateKeyVersion(key, version);
  if (!validation.isValid) {
    console.error('✗ Validation failed:');
    for (const error of validation.errors) {
      console.error(`  ${error}`);
    }
    console.error('');
    console.error('Examples: user_activity, voting_power, content_quality');
    process.exit(1);
  }

  const registryPath = config.outputPath ?? join(__dirname, '../registry');
  const keyDir = join(registryPath, key);
  const filePath = join(keyDir, `${version}.json`);

  if (existsSync(filePath) && !config.overwrite) {
    console.error(`✗ File already exists: ${filePath}`);
    console.error('  Use a different version, remove the existing file, or set overwrite: true');
    process.exit(1);
  }

  mkdirSync(keyDir, { recursive: true });

  const template = createAlgorithmTemplate(key, version, config);
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
  console.log('  4. Run: pnpm build');
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

  scaffoldAlgorithmImpl(key, version);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
