import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { InvalidStorageKeyError } from '../../src/shared/errors/index.js';
import { detectKeyType, generateKey, parseStorageKey } from '../../src/shared/utils/keys.js';

describe('generateKey', () => {
  describe('upload keys', () => {
    it('should generate a valid upload key with UUID', () => {
      const uuid = randomUUID();
      const key = generateKey('upload', uuid, 'votes.csv');

      expect(key).toBe(`uploads/${uuid}/votes.csv`);
    });

    it('should handle filenames with extensions', () => {
      const uuid = randomUUID();
      const key = generateKey('upload', uuid, 'myfile.csv');

      expect(key).toBe(`uploads/${uuid}/myfile.csv`);
    });

    it('should handle filenames without extensions', () => {
      const uuid = randomUUID();
      const key = generateKey('upload', uuid, 'data');

      expect(key).toBe(`uploads/${uuid}/data`);
    });

    it('should handle nested paths in filename', () => {
      const uuid = randomUUID();
      const key = generateKey('upload', uuid, 'subfolder/data.csv');

      expect(key).toBe(`uploads/${uuid}/subfolder/data.csv`);
    });
  });

  describe('snapshot keys', () => {
    it('should generate a valid snapshot key', () => {
      const key = generateKey('snapshot', 'abc123', 'voting_engagement.csv');

      expect(key).toBe('snapshots/abc123/voting_engagement.csv');
    });

    it('should handle filenames with extensions', () => {
      const key = generateKey('snapshot', 'abc123', 'results.json');

      expect(key).toBe('snapshots/abc123/results.json');
    });

    it('should handle filenames without extensions', () => {
      const key = generateKey('snapshot', 'abc123', 'config');

      expect(key).toBe('snapshots/abc123/config');
    });

    it('should handle nested paths in filename', () => {
      const key = generateKey('snapshot', 'abc123', 'outputs/results.csv');

      expect(key).toBe('snapshots/abc123/outputs/results.csv');
    });
  });
});

describe('detectKeyType', () => {
  it('should detect upload keys', () => {
    const uuid = randomUUID();
    expect(detectKeyType(`uploads/${uuid}/votes.csv`)).toBe('upload');
  });

  it('should detect snapshot keys', () => {
    expect(detectKeyType('snapshots/abc123/voting_engagement.csv')).toBe('snapshot');
  });

  it('should return null for unrecognized keys', () => {
    expect(detectKeyType('unknown/path/file.txt')).toBeNull();
    expect(detectKeyType('downloads/uuid/file.csv')).toBeNull();
  });
});

describe('parseStorageKey', () => {
  describe('upload keys', () => {
    it('should parse a valid upload key correctly', () => {
      const uuid = randomUUID();
      const result = parseStorageKey(`uploads/${uuid}/votes.csv`);

      expect(result).toEqual({
        type: 'upload',
        filename: 'votes.csv',
        ext: 'csv',
        uuid,
      });
    });

    it('should handle nested paths after UUID', () => {
      const uuid = randomUUID();
      const result = parseStorageKey(`uploads/${uuid}/subfolder/data.json`);

      expect(result).toEqual({
        type: 'upload',
        filename: 'subfolder/data.json',
        ext: 'json',
        uuid,
      });
    });

    it('should handle filenames with multiple dots', () => {
      const uuid = randomUUID();
      const result = parseStorageKey(`uploads/${uuid}/file.backup.csv`);

      expect(result).toEqual({
        type: 'upload',
        filename: 'file.backup.csv',
        ext: 'csv',
        uuid,
      });
    });

    it('should throw InvalidStorageKeyError if UUID segment is missing', () => {
      expect(() => parseStorageKey('uploads//votes.csv')).toThrow(InvalidStorageKeyError);
      expect(() => parseStorageKey('uploads//votes.csv')).toThrow('Missing UUID segment');
    });
  });

  describe('snapshot keys', () => {
    it('should parse a valid snapshot key correctly', () => {
      const result = parseStorageKey('snapshots/abc123/voting_engagement.csv');

      expect(result).toEqual({
        type: 'snapshot',
        filename: 'voting_engagement.csv',
        ext: 'csv',
        snapshotId: 'abc123',
      });
    });

    it('should handle nested paths in snapshot keys', () => {
      const result = parseStorageKey('snapshots/abc123/subfolder/results.json');

      expect(result).toEqual({
        type: 'snapshot',
        filename: 'subfolder/results.json',
        ext: 'json',
        snapshotId: 'abc123',
      });
    });

    it('should throw InvalidStorageKeyError if snapshotId segment is missing', () => {
      expect(() => parseStorageKey('snapshots//voting_engagement.csv')).toThrow(InvalidStorageKeyError);
      expect(() => parseStorageKey('snapshots//voting_engagement.csv')).toThrow('Missing snapshotId segment');
    });
  });

  describe('error handling', () => {
    it('should throw InvalidStorageKeyError for unrecognized key patterns', () => {
      expect(() => parseStorageKey('downloads/uuid/votes.csv')).toThrow(InvalidStorageKeyError);
    });

    it('should throw InvalidStorageKeyError if key has insufficient segments', () => {
      const uuid = randomUUID();
      expect(() => parseStorageKey(`uploads/${uuid}`)).toThrow(InvalidStorageKeyError);
      expect(() => parseStorageKey('uploads')).toThrow(InvalidStorageKeyError);
      expect(() => parseStorageKey('snapshots/abc123')).toThrow(InvalidStorageKeyError);
    });

    it('should throw InvalidStorageKeyError if filename has no extension', () => {
      const uuid = randomUUID();
      expect(() => parseStorageKey(`uploads/${uuid}/filenoext`)).toThrow(InvalidStorageKeyError);
      expect(() => parseStorageKey(`uploads/${uuid}/filenoext`)).toThrow('No file extension found');
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
});
