/**
 * @reputo/storage/config/storage
 *
 * Main storage configuration.
 */

import type { StorageIOConfig } from './storage-io.config.js';
import type { VerificationConfig } from './verification.config.js';

/**
 * Main configuration for the Storage class.
 *
 * This is the configuration interface used when creating a Storage instance.
 * It maintains backward compatibility with the original API.
 *
 * @example
 * ```typescript
 * const config: StorageConfig = {
 *   bucket: 'my-bucket',
 *   presignPutTtl: 3600,
 *   presignGetTtl: 900,
 *   maxSizeBytes: 104857600, // 100 MB
 *   contentTypeAllowlist: ['text/csv', 'application/json'],
 * };
 * ```
 */
export interface StorageConfig {
  /**
   * S3 bucket name where objects will be stored.
   */
  bucket: string;

  /**
   * Time-to-live for presigned PUT URLs in seconds.
   * Controls how long upload URLs remain valid.
   *
   * @example 3600 // 1 hour
   */
  presignPutTtl: number;

  /**
   * Time-to-live for presigned GET URLs in seconds.
   * Controls how long download URLs remain valid.
   *
   * @example 900 // 15 minutes
   */
  presignGetTtl: number;

  /**
   * Maximum allowed object size in bytes.
   * Files exceeding this size will be rejected.
   *
   * @example 104857600 // 100 MB
   */
  maxSizeBytes: number;

  /**
   * Allowed content types (MIME types) for uploads.
   * Only files with these content types will be accepted.
   *
   * @example ['text/csv', 'application/json', 'text/plain']
   */
  contentTypeAllowlist: string[];
}

/**
 * Factory function to create StorageIOConfig from StorageConfig.
 *
 * @param config - Main storage configuration
 * @returns Storage I/O configuration
 * @internal
 */
export function createIOConfig(config: StorageConfig): StorageIOConfig {
  return {
    uploadTtlSeconds: config.presignPutTtl,
    downloadTtlSeconds: config.presignGetTtl,
    maxFileSizeBytes: config.maxSizeBytes,
    allowedContentTypes: config.contentTypeAllowlist,
  };
}

/**
 * Factory function to create VerificationConfig from StorageConfig.
 *
 * @param config - Main storage configuration
 * @returns Verification configuration
 * @internal
 */
export function createVerificationConfig(config: StorageConfig): VerificationConfig {
  return {
    maxFileSizeBytes: config.maxSizeBytes,
    allowedContentTypes: config.contentTypeAllowlist,
  };
}
