import type { StorageErrorCode } from '../types/errors.js';

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }
  }
}

export class ObjectNotFoundError extends StorageError {
  public readonly code: StorageErrorCode = 'OBJECT_NOT_FOUND';
  public readonly key: string | undefined;

  constructor(key?: string) {
    const message = key ? `Object not found: ${key}` : 'Object not found';
    super(message);
    this.name = 'ObjectNotFoundError';
    this.key = key;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ObjectNotFoundError);
    }
  }
}

export class HeadObjectFailedError extends StorageError {
  public readonly code: StorageErrorCode = 'HEAD_OBJECT_FAILED';
  public readonly key: string | undefined;

  constructor(key?: string) {
    const message = key ? `Failed to retrieve object metadata: ${key}` : 'Failed to retrieve object metadata';
    super(message);
    this.name = 'HeadObjectFailedError';
    this.key = key;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HeadObjectFailedError);
    }
  }
}

export class FileTooLargeError extends StorageError {
  public readonly code: StorageErrorCode = 'FILE_TOO_LARGE';
  public readonly maxSizeBytes: number;

  constructor(maxSizeBytes: number) {
    super(`File too large. Maximum allowed size: ${maxSizeBytes} bytes`);
    this.name = 'FileTooLargeError';
    this.maxSizeBytes = maxSizeBytes;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FileTooLargeError);
    }
  }
}

export class InvalidContentTypeError extends StorageError {
  public readonly code: StorageErrorCode = 'INVALID_CONTENT_TYPE';
  public readonly contentType: string;
  public readonly allowedTypes: readonly string[];

  constructor(contentType: string, allowedTypes: string[]) {
    super(`Content type not allowed. Allowed: ${allowedTypes.join(', ')}. Got: ${contentType}`);
    this.name = 'InvalidContentTypeError';
    this.contentType = contentType;
    this.allowedTypes = allowedTypes;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidContentTypeError);
    }
  }
}

export class InvalidStorageKeyError extends StorageError {
  public readonly code: StorageErrorCode = 'INVALID_STORAGE_KEY';
  public readonly key: string;

  constructor(key: string, reason?: string) {
    const message = reason ? `Invalid storage key format: ${key}. ${reason}` : `Invalid storage key format: ${key}`;
    super(message);
    this.name = 'InvalidStorageKeyError';
    this.key = key;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidStorageKeyError);
    }
  }
}

