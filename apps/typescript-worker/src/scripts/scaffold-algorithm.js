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
const ACTIVITIES_DIR = join(process.cwd(), 'src', 'activities');
const ACTIVITIES_INDEX = join(ACTIVITIES_DIR, 'index.ts');
/**
 * Generate the scaffold content for a new algorithm activity.
 */
function generateActivityScaffold(algorithmKey) {
  const functionName = algorithmKey.replace(/-/g, '_');
  return `import pino from 'pino';
import '../storage.d.js';
import type {
  WorkerAlgorithmPayload,
  WorkerAlgorithmResult,
} from '../types/algorithm.js';
import { getInputLocation } from './utils.js';

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
    // biome-ignore lint/suspicious/noExplicitAny: storage is set on global at runtime
    const storage = (global as any).storage;
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

    // Upload output to storage
    const outputKey = \`snapshots/\${snapshotId}/outputs/\${algorithmKey}.csv\`;
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
 * Add export statement to activities index file.
 */
function addExportToIndex(algorithmKey) {
  const exportLine = `export * from './${algorithmKey}.activity.js';`;
  if (!existsSync(ACTIVITIES_INDEX)) {
    // Create new index file
    const content = `/**
 * Export all algorithm activities.
 *
 * Each exported function should match an AlgorithmDefinition.runtime.activity value.
 */
${exportLine}
`;
    writeFileSync(ACTIVITIES_INDEX, content, 'utf8');
    console.log(`✓ Created ${ACTIVITIES_INDEX}`);
    return;
  }
  // Check if export already exists
  const indexContent = readFileSync(ACTIVITIES_INDEX, 'utf8');
  if (indexContent.includes(exportLine)) {
    console.log('✓ Export already exists in index.ts');
    return;
  }
  // Append export to existing index
  const updatedContent = `${indexContent.trimEnd()}\n${exportLine}\n`;
  writeFileSync(ACTIVITIES_INDEX, updatedContent, 'utf8');
  console.log(`✓ Added export to ${ACTIVITIES_INDEX}`);
}
/**
 * Main scaffold function.
 */
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('❌ Error: Please provide an algorithm key');
    console.error('Usage: pnpm algorithm:new <algorithm_key>');
    console.error('Example: pnpm algorithm:new voting_engagement');
    process.exit(1);
  }
  const algorithmKey = args[0];
  // Validate algorithm key format
  if (!/^[a-z][a-z0-9_-]*$/.test(algorithmKey)) {
    console.error(
      '❌ Error: Algorithm key must start with a lowercase letter and contain only lowercase letters, numbers, hyphens, and underscores',
    );
    process.exit(1);
  }
  const activityFile = join(ACTIVITIES_DIR, `${algorithmKey}.activity.ts`);
  // Check if activity file already exists
  if (existsSync(activityFile)) {
    console.error(`❌ Error: Activity file already exists: ${activityFile}`);
    process.exit(1);
  }
  // Generate and write activity scaffold
  const scaffold = generateActivityScaffold(algorithmKey);
  writeFileSync(activityFile, scaffold, 'utf8');
  console.log(`✓ Created ${activityFile}`);
  // Add export to index
  addExportToIndex(algorithmKey);
  // Print success message and next steps
  console.log('\n✅ Algorithm activity scaffolded successfully!');
  console.log('\nNext steps:');
  console.log(`  1. Implement the algorithm logic in ${activityFile}`);
  console.log(`  2. Set runtime.taskQueue = "reputation-algorithms-typescript" in the algorithm definition`);
  console.log(`  3. Set runtime.activity = "${algorithmKey.replace(/-/g, '_')}" in the algorithm definition`);
  console.log('  4. Adjust input parsing and output serialization as needed');
  console.log(`  5. Update content type if not using CSV (e.g., 'application/json')`);
}
main();
