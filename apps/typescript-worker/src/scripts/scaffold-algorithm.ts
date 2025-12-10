#!/usr/bin/env tsx

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Scaffold script for creating new algorithm activities.
 *
 * Usage:
 *   pnpm algorithm:new <algorithm_key>
 *
 * Example:
 *   pnpm algorithm:new voting_engagement
 */

/**
 * Configuration for scaffolding an algorithm activity.
 */
export interface ScaffoldConfig {
  /** Base directory for the typescript-worker package */
  readonly baseDir: string;
  /** Whether to skip console output */
  readonly silent?: boolean;
}

/**
 * Result of scaffolding an algorithm activity.
 */
export interface ScaffoldResult {
  /** Path to the created activity file */
  readonly activityFile: string;
  /** Path to the activities index file */
  readonly indexFile: string;
  /** Whether the index was created or updated */
  readonly indexAction: 'created' | 'updated' | 'unchanged';
}

/**
 * Generate the scaffold content for a new algorithm activity.
 */
export function generateActivityScaffold(algorithmKey: string): string {
  const functionName = algorithmKey.replace(/-/g, '_');

  return `import { generateSnapshotOutputKey, type Storage } from '@reputo/storage';
import pino from 'pino';
import type {
  WorkerAlgorithmPayload,
  WorkerAlgorithmResult,
} from '../types/algorithm.js';
import { getInputLocation } from './utils.js';

// Extend global type to include storage
declare global {
  // eslint-disable-next-line no-var
  var storage: Storage | undefined;
}

// Create activity-specific logger
const logger = pino().child({ activity: '${algorithmKey}' });

/**
 * Activity implementation for the ${algorithmKey} algorithm.
 *
 * TODO: Add algorithm description and documentation.
 *
 * @param payload - Workflow payload containing snapshot and input locations
 * @returns Output locations for computed results
 */
export async function ${functionName}(
  payload: WorkerAlgorithmPayload,
): Promise<WorkerAlgorithmResult> {
  const { snapshotId, algorithmKey, algorithmVersion, inputLocations } =
    payload;

  logger.info('Starting ${algorithmKey} algorithm', {
    snapshotId,
    algorithmKey,
    algorithmVersion,
  });

  try {
    // Get storage instance from global (initialized in worker/main.ts)
    const storage = global.storage;
    if (!storage) {
      throw new Error('Storage instance not initialized. Ensure worker is properly started.');
    }

    // TODO: Use getInputLocation to resolve storage keys for your inputs
    // const inputKey = getInputLocation(inputLocations, 'your_input_key');
    // const buffer = await storage.getObject(inputKey);
    // const text = buffer.toString('utf8');

    // TODO: Parse input data (CSV, JSON, etc.)
    // Example for CSV:
    // import { parse } from 'csv-parse/sync';
    // const rows = parse(text, { columns: true, skip_empty_lines: true });

    // TODO: Implement algorithm computation logic
    // const results = computeResults(rows);

    // TODO: Serialize output data
    // Example for CSV:
    // import { stringify } from 'csv-stringify/sync';
    // const outputCsv = stringify(results, { header: true });

    // TODO: Replace with actual output content and content type
    const outputContent = '';
    const contentType = 'text/csv'; // or 'application/json', etc.

    // Upload output to storage using shared key generator
    const outputKey = generateSnapshotOutputKey(snapshotId, algorithmKey);
    await storage.putObject(outputKey, outputContent, contentType);

    logger.info('Uploaded ${algorithmKey} results', { outputKey });

    // Return output locations
    // TODO: Adjust output key to match AlgorithmDefinition.outputs[].key
    return {
      outputs: {
        ${algorithmKey}: outputKey,
      },
    };
  } catch (error) {
    logger.error('Failed to compute ${algorithmKey}', error as Error, {
      snapshotId,
      algorithmKey,
    });
    throw error;
  }
}
`;
}

/**
 * Validate algorithm key format.
 * @returns Error message if invalid, undefined if valid
 */
export function validateAlgorithmKey(algorithmKey: string): string | undefined {
  if (!/^[a-z][a-z0-9_]*$/.test(algorithmKey)) {
    return 'Algorithm key must start with a lowercase letter and contain only lowercase letters, numbers, and underscores';
  }
  return undefined;
}

/**
 * Check if an activity file already exists.
 */
export function activityExists(algorithmKey: string, baseDir: string): boolean {
  const activitiesDir = join(baseDir, 'src', 'activities');
  const activityFile = join(activitiesDir, `${algorithmKey}.activity.ts`);
  return existsSync(activityFile);
}

/**
 * Add export statement to activities index file.
 */
export function addExportToIndex(
  algorithmKey: string,
  baseDir: string,
  silent = false,
): 'created' | 'updated' | 'unchanged' {
  const activitiesDir = join(baseDir, 'src', 'activities');
  const indexFile = join(activitiesDir, 'index.ts');
  const exportLine = `export * from './${algorithmKey}.activity.js';`;

  if (!existsSync(indexFile)) {
    // Create new index file
    const content = `/**
 * Export all algorithm activities.
 *
 * Each exported function should match an AlgorithmDefinition.runtime.activity value.
 */
${exportLine}
`;
    writeFileSync(indexFile, content, 'utf8');
    if (!silent) {
      console.log(`✓ Created ${indexFile}`);
    }
    return 'created';
  }

  // Check if export already exists
  const indexContent = readFileSync(indexFile, 'utf8');
  if (indexContent.includes(exportLine)) {
    if (!silent) {
      console.log('✓ Export already exists in index.ts');
    }
    return 'unchanged';
  }

  // Append export to existing index
  const updatedContent = `${indexContent.trimEnd()}\n${exportLine}\n`;
  writeFileSync(indexFile, updatedContent, 'utf8');
  if (!silent) {
    console.log(`✓ Added export to ${indexFile}`);
  }
  return 'updated';
}

/**
 * Scaffold a new algorithm activity.
 *
 * @param algorithmKey - The algorithm key (snake_case)
 * @param config - Configuration options
 * @returns Result containing paths and actions taken
 * @throws Error if validation fails or file already exists
 */
export function scaffoldActivity(algorithmKey: string, config: ScaffoldConfig): ScaffoldResult {
  const { baseDir, silent = false } = config;

  // Validate algorithm key format
  const validationError = validateAlgorithmKey(algorithmKey);
  if (validationError) {
    throw new Error(validationError);
  }

  const activitiesDir = join(baseDir, 'src', 'activities');
  const activityFile = join(activitiesDir, `${algorithmKey}.activity.ts`);
  const indexFile = join(activitiesDir, 'index.ts');

  // Check if activity file already exists
  if (existsSync(activityFile)) {
    throw new Error(`Activity file already exists: ${activityFile}`);
  }

  // Generate and write activity scaffold
  const scaffold = generateActivityScaffold(algorithmKey);
  writeFileSync(activityFile, scaffold, 'utf8');
  if (!silent) {
    console.log(`✓ Created ${activityFile}`);
  }

  // Add export to index
  const indexAction = addExportToIndex(algorithmKey, baseDir, silent);

  return {
    activityFile,
    indexFile,
    indexAction,
  };
}

/**
 * Print usage information.
 */
function printUsage(): void {
  console.log('Usage: pnpm algorithm:new <algorithm_key>');
  console.log('');
  console.log('Arguments:');
  console.log('  algorithm_key  Algorithm key in snake_case (e.g., voting_engagement)');
  console.log('');
  console.log('Examples:');
  console.log('  pnpm algorithm:new voting_engagement');
  console.log('  pnpm algorithm:new proposal_engagement');
  console.log('');
}

/**
 * Main CLI function.
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const algorithmKey = args[0];

  if (!algorithmKey) {
    console.error('❌ Error: Please provide an algorithm key');
    printUsage();
    process.exit(1);
  }

  try {
    const result = scaffoldActivity(algorithmKey, {
      baseDir: process.cwd(),
    });

    // Print success message and next steps
    console.log('\n✅ Algorithm activity scaffolded successfully!');
    console.log('\nNext steps:');
    console.log(`  1. Implement the algorithm logic in ${result.activityFile}`);
    console.log('  2. Adjust input parsing and output serialization as needed');
    console.log("  3. Update content type if not using CSV (e.g., 'application/json')");
  } catch (error) {
    console.error(`❌ Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

// Run main only when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
