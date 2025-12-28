import { generateSnapshotOutputKey, type Storage } from '@reputo/storage';
import pino from 'pino';
import type { WorkerAlgorithmPayload, WorkerAlgorithmResult } from '../types/algorithm.js';
import { getInputLocation } from './utils.js';

// Extend global type to include storage
declare global {
  // eslint-disable-next-line no-var
  var storage: Storage | undefined;
}

// Create activity-specific logger
const logger = pino().child({ activity: 'contribution_score' });

/**
 * Activity implementation for the contribution_score algorithm.
 *
 * TODO: Add algorithm description and documentation.
 *
 * @param payload - Workflow payload containing snapshot and input locations
 * @returns Output locations for computed results
 */
export async function contribution_score(payload: WorkerAlgorithmPayload): Promise<WorkerAlgorithmResult> {
  // const { snapshotId, algorithmKey, algorithmVersion, inputLocations } =
  //   payload;

  // logger.info('Starting contribution_score algorithm', {
  //   snapshotId,
  //   algorithmKey,
  //   algorithmVersion,
  // });

  // try {
  //   // Get storage instance from global (initialized in worker/main.ts)
  //   const storage = global.storage;
  //   if (!storage) {
  //     throw new Error('Storage instance not initialized. Ensure worker is properly started.');
  //   }

  //   // TODO: Use getInputLocation to resolve storage keys for your inputs
  //   // const inputKey = getInputLocation(inputLocations, 'your_input_key');
  //   // const buffer = await storage.getObject(inputKey);
  //   // const text = buffer.toString('utf8');

  //   // TODO: Parse input data (CSV, JSON, etc.)
  //   // Example for CSV:
  //   // import { parse } from 'csv-parse/sync';
  //   // const rows = parse(text, { columns: true, skip_empty_lines: true });

  //   // TODO: Implement algorithm computation logic
  //   // const results = computeResults(rows);

  //   // TODO: Serialize output data
  //   // Example for CSV:
  //   // import { stringify } from 'csv-stringify/sync';
  //   // const outputCsv = stringify(results, { header: true });

  //   // TODO: Replace with actual output content and content type
  //   const outputContent = '';
  //   const contentType = 'text/csv'; // or 'application/json', etc.

  //   // Upload output to storage using shared key generator
  //   const outputKey = generateSnapshotOutputKey(snapshotId, algorithmKey);
  //   await storage.putObject(outputKey, outputContent, contentType);

  //   logger.info('Uploaded contribution_score results', { outputKey });

  //   // Return output locations
  //   // TODO: Adjust output key to match AlgorithmDefinition.outputs[].key
  //   return {
  //     outputs: {
  //       contribution_score: outputKey,
  //     },
  //   };
  // } catch (error) {
  //   logger.error('Failed to compute contribution_score', error as Error, {
  //     snapshotId,
  //     algorithmKey,
  //   });
  //   throw error;
  // }
  return { outputs: {} };
}
