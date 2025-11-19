/**
 * @reputo/storage/shared/errors/operation
 *
 * Operation-related error classes for storage operations.
 * These errors represent failures during S3 operations.
 */

import { StorageError } from './base.error.js';

/**
 * Error thrown when an object is not found in S3.
 *
 * This typically indicates a 404 response from S3.
 * Consuming applications should catch this and decide how to represent
 * the missing object (e.g., as a 404 HTTP response or a failed workflow step).
 *
 * @example
 * ```typescript
 * try {
 *   await storage.getObject('non-existent-key');
 * } catch (error) {
 *   if (error instanceof ObjectNotFoundError) {
 *     console.log('Object not found in S3');
 *   }
 * }
 * ```
 */
export class ObjectNotFoundError extends StorageError {
  /**
   * The S3 key that was not found.
   */
  readonly key: string | undefined;

  /**
   * Creates a new ObjectNotFoundError instance.
   *
   * @param key - Optional S3 key that was not found
   */
  constructor(key?: string) {
    const message = key ? `Object not found: ${key}` : 'Object not found';
    super(message);
    this.name = 'ObjectNotFoundError';
    this.key = key;
  }
}

/**
 * Error thrown when a HEAD request to S3 fails for reasons other than 404.
 *
 * This typically indicates a transient S3 error or permission issue.
 * Consuming applications should catch this and map it to an appropriate
 * internal error, retry mechanism, or failure state for their environment.
 *
 * @example
 * ```typescript
 * try {
 *   await storage.presignGet(key);
 * } catch (error) {
 *   if (error instanceof HeadObjectFailedError) {
 *     console.log('Failed to retrieve object metadata');
 *     // Implement retry logic or error reporting
 *   }
 * }
 * ```
 */
export class HeadObjectFailedError extends StorageError {
  /**
   * The S3 key for which the HEAD request failed.
   */
  readonly key: string | undefined;

  /**
   * Creates a new HeadObjectFailedError instance.
   *
   * @param key - Optional S3 key for which the HEAD request failed
   */
  constructor(key?: string) {
    const message = key ? `Failed to retrieve object metadata: ${key}` : 'Failed to retrieve object metadata';
    super(message);
    this.name = 'HeadObjectFailedError';
    this.key = key;
  }
}
