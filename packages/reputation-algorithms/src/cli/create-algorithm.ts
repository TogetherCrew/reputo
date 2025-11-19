import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  createAlgorithmTemplate,
  getModuleFileAndDir,
  resolveRegistryPath,
  type TemplateConfig,
  validateKey,
  validateVersion,
} from '../shared/utils/index.js';

const { dirname: __dirname } = getModuleFileAndDir(import.meta.url);

interface CreateAlgorithmConfig extends TemplateConfig {
  readonly outputPath?: string;
  readonly overwrite?: boolean;
}

export function createAlgorithm(key: string, version: string, config: CreateAlgorithmConfig = {}): void {
  const keyValidation = validateKey(key);
  const versionValidation = validateVersion(version);

  const allErrors = [...keyValidation.errors, ...versionValidation.errors];
  if (allErrors.length > 0) {
    console.error('✗ Validation failed:');
    for (const error of allErrors) {
      console.error(`  ${error}`);
    }
    console.error('');
    console.error('Examples: voting_engagement, proposal_engagement, contribution_engagement');
    process.exit(1);
  }

  const registryPath = resolveRegistryPath(__dirname, config.outputPath);
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
  console.log('  3. Run: pnpm registry:validate');
  console.log('  4. Run: pnpm build');
  console.log('');
}

function printUsage(): void {
  console.log('Usage: pnpm algorithm:create <key> <version>');
  console.log('');
  console.log('Arguments:');
  console.log('  key      Algorithm key in snake_case (e.g., voting_engagement)');
  console.log('  version  Semantic version (e.g., 1.0.0)');
  console.log('');
  console.log('Examples:');
  console.log('  pnpm algorithm:create voting_engagement 1.0.0');
  console.log('  pnpm algorithm:create proposal_engagement 2.1.0');
  console.log('  pnpm algorithm:create contribution_engagement 1.0.0-beta');
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

  createAlgorithm(key, version);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
