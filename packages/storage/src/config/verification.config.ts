/**
 * @reputo/storage/config/verification
 *
 * Configuration for upload verification.
 */

/**
 * Configuration for upload verification operations.
 *
 * This config controls how uploaded files are validated.
 */
export interface VerificationConfig {
  /**
   * Maximum allowed file size in bytes.
   * Files exceeding this size will be rejected during verification.
   *
   * @example 104857600 // 100 MB
   */
  maxFileSizeBytes: number;

  /**
   * Allowed content types (MIME types) for uploads.
   * Only files with these content types will pass verification.
   *
   * @example ['text/csv', 'application/json', 'text/plain']
   */
  allowedContentTypes: string[];
}
