/**
 * @reputo/storage/shared/types/metadata
 *
 * Metadata type definitions for storage objects.
 */

/**
 * Parsed components of a storage key.
 * Extracted from the key path structure.
 *
 * Storage keys follow the convention: `uploads/{timestamp}/{filename}.{ext}`
 */
export interface ParsedStorageKey {
  /**
   * Full filename including extension.
   */
  filename: string;

  /**
   * File extension without the dot.
   */
  ext: string;

  /**
   * Unix timestamp (seconds since epoch) when the key was generated.
   */
  timestamp: number;
}
