/**
 * @reputo/storage/shared/errors
 *
 * Framework-agnostic error classes for storage operations.
 * These errors can be wrapped by framework-specific exceptions
 * (e.g., NestJS HTTP exceptions) by consuming applications.
 */

/**
 * Base error class for all storage-related errors.
 * Extends the standard Error class with proper name and stack trace.
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
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a file exceeds the maximum allowed size.
 *
 * Applications should catch this and return an appropriate HTTP 400 response
 * or handle it according to their error handling strategy.
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
 * Applications should catch this and return an appropriate HTTP 400 response
 * or handle it according to their error handling strategy.
 */
export class InvalidContentTypeError extends StorageError {
  /**
   * The content type that was rejected.
   */
  readonly contentType: string;

  /**
   * List of allowed content types.
   */
  readonly allowedTypes: string[];

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
 * Error thrown when an object is not found in S3.
 *
 * This typically indicates a 404 response from S3.
 * Applications should catch this and return an appropriate HTTP 404 response
 * or handle it according to their error handling strategy.
 */
export class ObjectNotFoundError extends StorageError {
  /**
   * Creates a new ObjectNotFoundError instance.
   *
   * @param key - Optional S3 key that was not found
   */
  constructor(key?: string) {
    const message = key ? `Object not found: ${key}` : 'Object not found';
    super(message);
    this.name = 'ObjectNotFoundError';
  }
}

/**
 * Error thrown when a HEAD request to S3 fails for reasons other than 404.
 *
 * This typically indicates a transient S3 error or permission issue.
 * Applications should catch this and return an appropriate HTTP 500 response
 * or handle it according to their error handling strategy.
 */
export class HeadObjectFailedError extends StorageError {
  /**
   * Creates a new HeadObjectFailedError instance.
   *
   * @param key - Optional S3 key for which the HEAD request failed
   */
  constructor(key?: string) {
    const message = key ? `Failed to retrieve object metadata: ${key}` : 'Failed to retrieve object metadata';
    super(message);
    this.name = 'HeadObjectFailedError';
  }
}

/**
 * Error thrown when a storage key has an invalid format.
 *
 * This indicates the key doesn't match the expected structure
 * (e.g., 'uploads/{timestamp}/{filename}.{ext}').
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
