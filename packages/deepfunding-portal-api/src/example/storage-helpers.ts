/**
 * S3 storage helper utilities for the DeepFunding Portal data sync example
 *
 * Provides functions to store fetched data as JSON snapshots in S3.
 * Uses the generateKey utility from @reputo/storage for consistent key generation.
 */

import type { S3Client } from '@aws-sdk/client-s3';
import { generateKey, Storage } from '@reputo/storage';
import { S3_CONFIG } from './config.js';

/**
 * Create a Storage instance with the configured S3 client
 */
export function createStorage(s3Client: S3Client): Storage {
  return new Storage(
    {
      bucket: S3_CONFIG.bucket,
      presignPutTtl: S3_CONFIG.presignPutTtl,
      presignGetTtl: S3_CONFIG.presignGetTtl,
      maxSizeBytes: S3_CONFIG.maxSizeBytes,
      contentTypeAllowlist: [...S3_CONFIG.contentTypeAllowlist],
    },
    s3Client,
  );
}

/**
 * Store non-paginated resource data to S3
 *
 * @param storage - Storage instance
 * @param snapshotId - Unique identifier for this snapshot run
 * @param resourceName - Name of the resource (e.g., 'rounds', 'pools')
 * @param data - Data to store (will be JSON-stringified)
 * @returns The S3 key where data was stored
 *
 * @example
 * ```typescript
 * await storeNonPaginated(storage, 'abc123', 'rounds', roundsData)
 * // Stores to: 'snapshots/abc123/rounds.json'
 * ```
 */
export async function storeNonPaginated<T>(
  storage: Storage,
  snapshotId: string,
  resourceName: string,
  data: T,
): Promise<string> {
  const key = generateKey('snapshot', snapshotId, `${resourceName}.json`);
  const body = JSON.stringify(data, null, 2);
  await storage.putObject(key, body, 'application/json');
  return key;
}

/**
 * Store a single page of paginated resource data to S3
 *
 * @param storage - Storage instance
 * @param snapshotId - Unique identifier for this snapshot run
 * @param resourceName - Name of the resource (e.g., 'milestones', 'users')
 * @param page - Page number (1-indexed)
 * @param data - Page data to store (will be JSON-stringified)
 * @returns The S3 key where data was stored
 *
 * @example
 * ```typescript
 * await storePaginatedPage(storage, 'abc123', 'users', 1, usersPage)
 * // Stores to: 'snapshots/abc123/users_page_1.json'
 * ```
 */
export async function storePaginatedPage<T>(
  storage: Storage,
  snapshotId: string,
  resourceName: string,
  page: number,
  data: T,
): Promise<string> {
  const key = generateKey('snapshot', snapshotId, `${resourceName}_page_${page}.json`);
  const body = JSON.stringify(data, null, 2);
  await storage.putObject(key, body, 'application/json');
  return key;
}

/**
 * Store proposals for a specific round to S3
 *
 * @param storage - Storage instance
 * @param snapshotId - Unique identifier for this snapshot run
 * @param roundId - Round ID
 * @param data - Proposals data to store
 * @returns The S3 key where data was stored
 *
 * @example
 * ```typescript
 * await storeProposalsForRound(storage, 'abc123', 5, proposalsData)
 * // Stores to: 'snapshots/abc123/proposals_round_5.json'
 * ```
 */
export async function storeProposalsForRound<T>(
  storage: Storage,
  snapshotId: string,
  roundId: number,
  data: T,
): Promise<string> {
  const key = generateKey('snapshot', snapshotId, `proposals_round_${roundId}.json`);
  const body = JSON.stringify(data, null, 2);
  await storage.putObject(key, body, 'application/json');
  return key;
}
