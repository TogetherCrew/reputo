import { describe, expect, it } from 'vitest';
import {
  FileTooLargeError,
  HeadObjectFailedError,
  InvalidContentTypeError,
  InvalidStorageKeyError,
  ObjectNotFoundError,
  StorageError,
} from '../../src/shared/errors/index.js';

describe('StorageError', () => {
  it('should create an error with correct name and message', () => {
    const error = new StorageError('Test error message');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('StorageError');
    expect(error.message).toBe('Test error message');
  });

  it('should have a stack trace', () => {
    const error = new StorageError('Test error');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('StorageError');
  });
});

describe('FileTooLargeError', () => {
  it('should create an error with correct properties', () => {
    const maxSize = 10485760; // 10 MB
    const error = new FileTooLargeError(maxSize);

    expect(error).toBeInstanceOf(StorageError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('FileTooLargeError');
    expect(error.message).toBe('File too large. Maximum allowed size: 10485760 bytes');
    expect(error.maxSizeBytes).toBe(maxSize);
  });

  it('should format message with different sizes', () => {
    const error1 = new FileTooLargeError(1024);
    expect(error1.message).toContain('1024 bytes');

    const error2 = new FileTooLargeError(104857600);
    expect(error2.message).toContain('104857600 bytes');
  });
});

describe('InvalidContentTypeError', () => {
  it('should create an error with correct properties', () => {
    const contentType = 'application/pdf';
    const allowedTypes = ['text/csv', 'application/json'];
    const error = new InvalidContentTypeError(contentType, allowedTypes);

    expect(error).toBeInstanceOf(StorageError);
    expect(error.name).toBe('InvalidContentTypeError');
    expect(error.message).toBe('Content type not allowed. Allowed: text/csv, application/json. Got: application/pdf');
    expect(error.contentType).toBe(contentType);
    expect(error.allowedTypes).toEqual(allowedTypes);
  });

  it('should format message with single allowed type', () => {
    const error = new InvalidContentTypeError('text/html', ['text/csv']);

    expect(error.message).toContain('Allowed: text/csv');
    expect(error.message).toContain('Got: text/html');
  });

  it('should format message with multiple allowed types', () => {
    const allowedTypes = ['text/csv', 'text/plain', 'application/json'];
    const error = new InvalidContentTypeError('text/html', allowedTypes);

    expect(error.message).toContain('text/csv, text/plain, application/json');
  });
});

describe('ObjectNotFoundError', () => {
  it('should create an error with default message when key is not provided', () => {
    const error = new ObjectNotFoundError();

    expect(error).toBeInstanceOf(StorageError);
    expect(error.name).toBe('ObjectNotFoundError');
    expect(error.message).toBe('Object not found');
  });

  it('should create an error with key in message when provided', () => {
    const key = 'uploads/1704067200/votes.csv';
    const error = new ObjectNotFoundError(key);

    expect(error.message).toBe(`Object not found: ${key}`);
  });
});

describe('HeadObjectFailedError', () => {
  it('should create an error with default message when key is not provided', () => {
    const error = new HeadObjectFailedError();

    expect(error).toBeInstanceOf(StorageError);
    expect(error.name).toBe('HeadObjectFailedError');
    expect(error.message).toBe('Failed to retrieve object metadata');
  });

  it('should create an error with key in message when provided', () => {
    const key = 'uploads/1704067200/votes.csv';
    const error = new HeadObjectFailedError(key);

    expect(error.message).toBe(`Failed to retrieve object metadata: ${key}`);
  });
});

describe('InvalidStorageKeyError', () => {
  it('should create an error with key in message', () => {
    const key = 'invalid/key/format';
    const error = new InvalidStorageKeyError(key);

    expect(error).toBeInstanceOf(StorageError);
    expect(error.name).toBe('InvalidStorageKeyError');
    expect(error.message).toBe(`Invalid storage key format: ${key}`);
    expect(error.key).toBe(key);
  });

  it('should include reason in message when provided', () => {
    const key = 'invalid/key';
    const reason = 'Missing timestamp segment';
    const error = new InvalidStorageKeyError(key, reason);

    expect(error.message).toBe(`Invalid storage key format: ${key}. ${reason}`);
    expect(error.key).toBe(key);
  });
});
