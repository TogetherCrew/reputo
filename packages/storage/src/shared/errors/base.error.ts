/**
 * @reputo/storage/shared/errors/base
 *
 * Base error class for all storage-related errors.
 */

/**
 * Base error class for all storage-related errors.
 * Extends the standard Error class with proper name and stack trace.
 *
 * All storage-specific errors should extend this class to maintain
 * a consistent error hierarchy that consumers can catch and handle.
 */
export class StorageError extends Error {
  /**
   * Creates a new StorageError instance.
   *
   * @param message - Human-readable error message
   */
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
