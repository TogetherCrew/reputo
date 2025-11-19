/**
 * @reputo/storage/config/storage-io
 *
 * Configuration for storage I/O operations.
 */

/**
 * Configuration for storage I/O operations (upload, download, read, write).
 *
 * This config controls the behavior of presigned URLs and file constraints.
 */
export interface StorageIOConfig {
  /**
   * Time-to-live for presigned upload URLs in seconds.
   *
   * @example 3600 // 1 hour
   */
  uploadTtlSeconds: number;

  /**
   * Time-to-live for presigned download URLs in seconds.
   *
   * @example 900 // 15 minutes
   */
  downloadTtlSeconds: number;

  /**
   * Maximum allowed file size in bytes.
   * Files exceeding this size will be rejected.
   *
   * @example 104857600 // 100 MB
   */
  maxFileSizeBytes: number;

  /**
   * Allowed content types (MIME types) for uploads.
   * Only files with these content types will be accepted.
   *
   * @example ['text/csv', 'application/json', 'text/plain']
   */
  allowedContentTypes: string[];
}
