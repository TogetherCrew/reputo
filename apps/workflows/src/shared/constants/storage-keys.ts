/**
 * Storage key constants and helpers for snapshot artifacts.
 */

export const DEEPFUNDING_DB_FILENAME = 'deepfunding.db';

/**
 * Generate the storage key for the DeepFunding database file.
 *
 * @param snapshotId - The snapshot ID
 * @returns Storage key path for the database file
 */
export function getDeepfundingDbKey(snapshotId: string): string {
  return `snapshots/${snapshotId}/${DEEPFUNDING_DB_FILENAME}`;
}
