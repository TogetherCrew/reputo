import { describe, expect, it } from 'vitest';
import {
  DuplicateError,
  KeyMismatchError,
  NotFoundError,
  ValidationError,
  VersionMismatchError,
} from '../../../src/api/error';

describe('Errors: NotFoundError', () => {
  describe('KEY_NOT_FOUND', () => {
    it('should create error with correct properties', () => {
      const error = new NotFoundError('KEY_NOT_FOUND', 'test_algorithm');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.name).toBe('NotFoundError');
      expect(error.code).toBe('KEY_NOT_FOUND');
      expect(error.key).toBe('test_algorithm');
      expect(error.version).toBeUndefined();
      expect(error.message).toBe('Algorithm not found');
    });

    it('should have proper stack trace', () => {
      const error = new NotFoundError('KEY_NOT_FOUND', 'test_key');
      expect(error.stack).toBeTruthy();
      expect(error.stack).toContain('NotFoundError');
    });
  });

  describe('VERSION_NOT_FOUND', () => {
    it('should create error with correct properties', () => {
      const error = new NotFoundError('VERSION_NOT_FOUND', 'test_algorithm', '2.5.0');

      expect(error.code).toBe('VERSION_NOT_FOUND');
      expect(error.key).toBe('test_algorithm');
      expect(error.version).toBe('2.5.0');
      expect(error.message).toBe('Version not found');
    });
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new NotFoundError('KEY_NOT_FOUND', 'test');
    }).toThrow(NotFoundError);
  });
});

describe('Errors: DuplicateError', () => {
  it('should create error with proper properties', () => {
    const error = new DuplicateError('/src/registry/test_algo/1.0.0.json', 'test_algo', '1.0.0');

    expect(error.name).toBe('DuplicateError');
    expect(error.filePath).toBe('/src/registry/test_algo/1.0.0.json');
    expect(error.key).toBe('test_algo');
    expect(error.version).toBe('1.0.0');
    expect(error.message).toContain('Duplicate definition');
    expect(error.message).toContain('test_algo@1.0.0');
    expect(error.message).toContain('/src/registry/test_algo/1.0.0.json');
  });

  it('should extend Error and BuildError', () => {
    const error = new DuplicateError('/path/file.json', 'key', '1.0.0');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('Errors: VersionMismatchError', () => {
  it('should create error with proper properties', () => {
    const error = new VersionMismatchError('/src/registry/test_algo/1.0.0.json', '1.0.0', '2.0.0', 'test_algo');

    expect(error.name).toBe('VersionMismatchError');
    expect(error.filePath).toBe('/src/registry/test_algo/1.0.0.json');
    expect(error.filenameVersion).toBe('1.0.0');
    expect(error.contentVersion).toBe('2.0.0');
    expect(error.key).toBe('test_algo');
    expect(error.version).toBe('2.0.0');
    expect(error.message).toContain('Filename version 1.0.0');
    expect(error.message).toContain('content version 2.0.0');
  });
});

describe('Errors: KeyMismatchError', () => {
  it('should create error with proper properties', () => {
    const error = new KeyMismatchError('/src/registry/folder_name/1.0.0.json', 'folder_name', 'content_name', '1.0.0');

    expect(error.name).toBe('KeyMismatchError');
    expect(error.filePath).toBe('/src/registry/folder_name/1.0.0.json');
    expect(error.folderKey).toBe('folder_name');
    expect(error.contentKey).toBe('content_name');
    expect(error.key).toBe('content_name');
    expect(error.version).toBe('1.0.0');
    expect(error.message).toContain('Folder key folder_name');
    expect(error.message).toContain('content key content_name');
  });
});

describe('Errors: ValidationError', () => {
  it('should create error with single validation error', () => {
    const errors = [
      {
        instancePath: '/key',
        message: 'must be string',
        keyword: 'type',
        params: { type: 'string' },
      },
    ];

    const error = new ValidationError('/src/registry/test/1.0.0.json', errors, 'test_key', '1.0.0');

    expect(error.name).toBe('ValidationError');
    expect(error.filePath).toBe('/src/registry/test/1.0.0.json');
    expect(error.errors).toEqual(errors);
    expect(error.key).toBe('test_key');
    expect(error.version).toBe('1.0.0');
    expect(error.message).toContain('Schema validation failed');
    expect(error.message).toContain('/key: must be string');
  });

  it('should create error with multiple validation errors', () => {
    const errors = [
      {
        instancePath: '/key',
        message: 'must be string',
        keyword: 'type',
        params: {},
      },
      {
        instancePath: '/version',
        message: 'must match pattern',
        keyword: 'pattern',
        params: {},
      },
      {
        instancePath: '/category',
        message: 'must be one of allowed values',
        keyword: 'enum',
        params: {},
      },
    ];

    const error = new ValidationError('/path/file.json', errors);

    expect(error.errors.length).toBe(3);
    expect(error.message).toContain('/key');
    expect(error.message).toContain('/version');
    expect(error.message).toContain('/category');
  });

  it('should handle errors without message property', () => {
    const errors = [
      {
        instancePath: '/outputs',
        message: undefined,
        keyword: 'minItems',
        params: { minItems: 1 },
      },
    ];

    const error = new ValidationError('/path/file.json', errors);

    expect(error.message).toContain('/outputs');
    expect(error.message).toContain('minItems');
  });
});
