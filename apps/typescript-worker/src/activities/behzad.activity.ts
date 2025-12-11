import { generateSnapshotOutputKey, type Storage } from '@reputo/storage';
import type { WorkerAlgorithmPayload, WorkerAlgorithmResult } from '../types/algorithm.js';

// Extend global type to include storage (set in worker bootstrap).
declare global {
  // eslint-disable-next-line no-var
  var storage: Storage | undefined;
}

/**
 * Minimal example activity. It writes a small CSV output without
 * reading any inputs. Replace the inline CSV and output key as needed.
 */
export async function behzad(payload: WorkerAlgorithmPayload): Promise<WorkerAlgorithmResult> {
  const storage = global.storage;
  if (!storage) {
    throw new Error('Storage instance not initialized. Ensure worker is started.');
  }

  const outputKey = generateSnapshotOutputKey(payload.snapshotId, payload.algorithmKey);
  const csv = 'id,value\nexample,1\n';

  await storage.putObject(outputKey, csv, 'text/csv');

  return {
    outputs: {
      behzad: outputKey,
    },
  };
}
