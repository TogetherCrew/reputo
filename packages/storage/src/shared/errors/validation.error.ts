/**
 * @reputo/storage/shared/errors/validation
 *
 * Validation-related error classes for storage operations.
 * These errors represent user input or configuration validation failures.
 */

import { StorageError } from './base.error.js';

/**
 * Error thrown when a file exceeds the maximum allowed size.
 *
 * This error should be caught by consuming applications and treated
 * as a user-facing validation error (e.g., 400 Bad Request in HTTP APIs).
 *
 * @example
 * ```typescript
 * try {
 *   await storage.verifyUpload(key);
 * } catch (error) {
 *   if (error instanceof FileTooLargeError) {
 *     console.log(`File too large. Max: ${error.maxSizeBytes} bytes`);
 *   }
 * }
 * ```
 */
export class FileTooLargeError extends StorageError {
  /**
   * Maximum allowed file size in bytes.
   */
  readonly maxSizeBytes: number;

  /**
   * Creates a new FileTooLargeError instance.
   *
   * @param maxSizeBytes - The maximum allowed file size in bytes
   */
  constructor(maxSizeBytes: number) {
    super(`File too large. Maximum allowed size: ${maxSizeBytes} bytes`);
    this.name = 'FileTooLargeError';
    this.maxSizeBytes = maxSizeBytes;
  }
}

/**
 * Error thrown when a file's content type is not in the allowlist.
 *
 * This error should be caught by consuming applications and treated
 * as a user-facing validation error (e.g., 400 Bad Request in HTTP APIs).
 *
 * @example
 * ```typescript
 * try {
 *   await storage.presignPut('file.exe', 'application/x-msdownload');
 * } catch (error) {
 *   if (error instanceof InvalidContentTypeError) {
 *     console.log(`Invalid type: ${error.contentType}`);
 *     console.log(`Allowed: ${error.allowedTypes.join(', ')}`);
 *   }
 * }
 * ```
 */
export class InvalidContentTypeError extends StorageError {
  /**
   * The content type that was rejected.
   */
  readonly contentType: string;

  /**
   * List of allowed content types.
   */
  readonly allowedTypes: readonly string[];

  /**
   * Creates a new InvalidContentTypeError instance.
   *
   * @param contentType - The content type that was rejected
   * @param allowedTypes - List of allowed content types
   */
  constructor(contentType: string, allowedTypes: string[]) {
    super(`Content type not allowed. Allowed: ${allowedTypes.join(', ')}. Got: ${contentType}`);
    this.name = 'InvalidContentTypeError';
    this.contentType = contentType;
    this.allowedTypes = allowedTypes;
  }
}

/**
 * Error thrown when a storage key has an invalid format.
 *
 * This indicates the key doesn't match the expected structure
 * (e.g., 'uploads/{timestamp}/{filename}.{ext}').
 *
 * @example
 * ```typescript
 * try {
 *   parseStorageKey('invalid-key');
 * } catch (error) {
 *   if (error instanceof InvalidStorageKeyError) {
 *     console.log(`Invalid key: ${error.key}`);
 *   }
 * }
 * ```
 */
export class InvalidStorageKeyError extends StorageError {
  /**
   * The invalid key that was provided.
   */
  readonly key: string;

  /**
   * Creates a new InvalidStorageKeyError instance.
   *
   * @param key - The invalid storage key
   * @param reason - Optional reason why the key is invalid
   */
  constructor(key: string, reason?: string) {
    const message = reason ? `Invalid storage key format: ${key}. ${reason}` : `Invalid storage key format: ${key}`;
    super(message);
    this.name = 'InvalidStorageKeyError';
    this.key = key;
  }
}
