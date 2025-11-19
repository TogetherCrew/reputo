import { describe, expect, it } from 'vitest';
import { InvalidStorageKeyError } from '../../../../src/shared/errors/index.js';
import { generateUploadKey, parseStorageKey } from '../../../../src/shared/utils/keys.js';

describe('generateUploadKey', () => {
  it('should generate a valid key with timestamp, sanitized filename, and extension', () => {
    const now = new Date('2024-01-01T00:00:00Z');
    const key = generateUploadKey('votes.csv', 'text/csv', now);

    expect(key).toBe('uploads/1704067200/votes.csv');
  });

  it('should sanitize filenames by replacing spaces with hyphens', () => {
    const now = new Date('2024-01-01T00:00:00Z');
    const key = generateUploadKey('My Data File.csv', 'text/csv', now);

    expect(key).toBe('uploads/1704067200/My-Data-File.csv');
  });

  it('should remove special characters from filenames', () => {
    const now = new Date('2024-01-01T00:00:00Z');
    const key = generateUploadKey('data@2024!.csv', 'text/csv', now);

    expect(key).toBe('uploads/1704067200/data2024.csv');
  });

  it('should handle filenames without extensions', () => {
    const now = new Date('2024-01-01T00:00:00Z');
    const key = generateUploadKey('myfile', 'text/csv', now);

    expect(key).toBe('uploads/1704067200/myfile.csv');
  });

  it('should use current time when now is not provided', () => {
    const before = Math.floor(Date.now() / 1000);
    const key = generateUploadKey('test.csv', 'text/csv');
    const after = Math.floor(Date.now() / 1000);

    const parts = key.split('/');
    const timestamp = Number.parseInt(parts[1] ?? '0', 10);

    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });

  it('should map content types to correct extensions', () => {
    const now = new Date('2024-01-01T00:00:00Z');

    expect(generateUploadKey('file.csv', 'text/csv', now)).toContain('.csv');
    expect(generateUploadKey('file.txt', 'text/plain', now)).toContain('.txt');
    expect(generateUploadKey('file.json', 'application/json', now)).toContain('.json');
    expect(generateUploadKey('file.bin', 'application/octet-stream', now)).toContain('.bin');
  });

  it('should use .bin extension for unknown content types', () => {
    const now = new Date('2024-01-01T00:00:00Z');
    const key = generateUploadKey('file.xyz', 'application/unknown', now);

    expect(key).toBe('uploads/1704067200/file.bin');
  });

  it('should truncate long filenames to 200 characters', () => {
    const longName = 'a'.repeat(250);
    const now = new Date('2024-01-01T00:00:00Z');
    const key = generateUploadKey(`${longName}.csv`, 'text/csv', now);

    const parts = key.split('/');
    const filename = parts[2] ?? '';
    const nameWithoutExt = filename.replace('.csv', '');

    expect(nameWithoutExt.length).toBe(200);
  });

  it('should return "file" when filename sanitization results in empty string', () => {
    const now = new Date('2024-01-01T00:00:00Z');
    const key = generateUploadKey('!!!.csv', 'text/csv', now);

    expect(key).toBe('uploads/1704067200/file.csv');
  });
});

describe('parseStorageKey', () => {
  it('should parse a valid key correctly', () => {
    const result = parseStorageKey('uploads/1704067200/votes.csv');

    expect(result).toEqual({
      filename: 'votes.csv',
      ext: 'csv',
      timestamp: 1704067200,
    });
  });

  it('should handle nested paths after timestamp', () => {
    const result = parseStorageKey('uploads/1704067200/subfolder/data.json');

    expect(result).toEqual({
      filename: 'subfolder/data.json',
      ext: 'json',
      timestamp: 1704067200,
    });
  });

  it('should handle filenames with multiple dots', () => {
    const result = parseStorageKey('uploads/1704067200/file.backup.csv');

    expect(result).toEqual({
      filename: 'file.backup.csv',
      ext: 'csv',
      timestamp: 1704067200,
    });
  });

  it('should throw InvalidStorageKeyError if key does not start with "uploads/"', () => {
    expect(() => parseStorageKey('downloads/1704067200/votes.csv')).toThrow(InvalidStorageKeyError);
    expect(() => parseStorageKey('downloads/1704067200/votes.csv')).toThrow('Key must start with "uploads/"');
  });

  it('should throw InvalidStorageKeyError if key has fewer than 3 segments', () => {
    expect(() => parseStorageKey('uploads/1704067200')).toThrow(InvalidStorageKeyError);
    expect(() => parseStorageKey('uploads')).toThrow(InvalidStorageKeyError);
  });

  it('should throw InvalidStorageKeyError if timestamp is not a number', () => {
    expect(() => parseStorageKey('uploads/notanumber/votes.csv')).toThrow(InvalidStorageKeyError);
    expect(() => parseStorageKey('uploads/notanumber/votes.csv')).toThrow('Invalid timestamp');
  });

  it('should throw InvalidStorageKeyError if filename has no extension', () => {
    expect(() => parseStorageKey('uploads/1704067200/filenoext')).toThrow(InvalidStorageKeyError);
    expect(() => parseStorageKey('uploads/1704067200/filenoext')).toThrow('No file extension found');
  });

  it('should preserve the invalid key in the error', () => {
    const invalidKey = 'invalid/key/format';
    try {
      parseStorageKey(invalidKey);
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidStorageKeyError);
      expect((error as InvalidStorageKeyError).key).toBe(invalidKey);
    }
  });
});
