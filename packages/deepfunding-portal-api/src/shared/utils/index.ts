/**
 * Shared utility functions
 */

export * from './pagination.js';

/**
 * Default chunk size for batch operations
 */
export const DEFAULT_CHUNK_SIZE = 100;

/**
 * Split an array into chunks of a specified size
 *
 * @param array - The array to chunk
 * @param size - The maximum size of each chunk
 * @returns An array of chunks
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Options for batch create operations
 */
export type CreateManyOptions = {
  /** Number of items per chunk (default: 500) */
  chunkSize?: number;
};
