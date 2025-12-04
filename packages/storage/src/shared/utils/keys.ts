/**
 * @reputo/storage/shared/utils/keys
 *
 * Utilities for generating and parsing S3 storage keys.
 *
 * Supported key patterns:
 * - Uploads: `uploads/{timestamp}/{filename}.{ext}`
 * - Snapshot inputs: `snapshots/{snapshotId}/inputs/{inputName}.{ext}`
 * - Snapshot outputs: `snapshots/{snapshotId}/outputs/{algorithmKey}.{ext}`
 */

import { InvalidStorageKeyError } from '../errors/index.js';
import type { ParsedStorageKey, StorageKeyType } from '../types/index.js';

/**
 * Maps content types to file extensions.
 *
 * @internal
 */
const EXTENSION_MAP: Record<string, string> = {
  'text/csv': 'csv',
  'text/plain': 'txt',
  'application/json': 'json',
  'application/octet-stream': 'bin',
};

/**
 * Derives a file extension from a content type.
 * Falls back to 'bin' for unknown content types.
 *
 * @param contentType - MIME type (e.g., 'text/csv')
 * @returns File extension without the dot (e.g., 'csv')
 *
 * @internal
 */
function getExtensionFromContentType(contentType: string): string {
  return EXTENSION_MAP[contentType] ?? 'bin';
}

/**
 * Sanitizes a filename by removing the extension, replacing spaces with hyphens,
 * removing non-alphanumeric characters (except hyphens and underscores),
 * and truncating to 200 characters.
 *
 * @param filename - Original filename to sanitize
 * @returns Sanitized filename without extension
 *
 * @internal
 *
 * @example
 * ```typescript
 * sanitizeFilename('My Data File.csv')
 * // Returns: 'My-Data-File'
 *
 * sanitizeFilename('data@2024!.csv')
 * // Returns: 'data2024'
 * ```
 */
function sanitizeFilename(filename: string): string {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');

  // Replace spaces with hyphens and remove unsafe characters
  const sanitized = nameWithoutExt.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');

  // Truncate and ensure at least 'file' is returned
  return sanitized.slice(0, 200) || 'file';
}

/**
 * Generates an S3 key for uploading a file.
 *
 * The generated key follows the pattern: `uploads/{timestamp}/{sanitized-filename}.{ext}`
 * - timestamp: Unix timestamp in seconds
 * - sanitized-filename: Cleaned version of the original filename
 * - ext: File extension derived from content type
 *
 * @param filename - Original filename (e.g., 'my data.csv')
 * @param contentType - MIME type (e.g., 'text/csv')
 * @param now - Optional Date object for timestamp generation (defaults to current time)
 * @returns S3 key path
 *
 * @example
 * ```typescript
 * generateUploadKey('votes.csv', 'text/csv')
 * // Returns: 'uploads/1732147200/votes.csv'
 *
 * generateUploadKey('My Data File.csv', 'text/csv', new Date('2024-01-01'))
 * // Returns: 'uploads/1704067200/My-Data-File.csv'
 * ```
 */
export function generateUploadKey(filename: string, contentType: string, now: Date = new Date()): string {
  const timestamp = Math.floor(now.getTime() / 1000);
  const ext = getExtensionFromContentType(contentType);
  const sanitized = sanitizeFilename(filename);

  return `uploads/${timestamp}/${sanitized}.${ext}`;
}

/**
 * Generates an S3 key for a snapshot input file.
 *
 * The generated key follows the pattern: `snapshots/{snapshotId}/inputs/{inputName}.{ext}`
 *
 * @param snapshotId - Unique identifier of the snapshot
 * @param inputName - Logical input name (e.g., 'votes', 'users')
 * @param ext - File extension without the dot (defaults to 'csv')
 * @returns S3 key path
 *
 * @example
 * ```typescript
 * generateSnapshotInputKey('abc123', 'votes')
 * // Returns: 'snapshots/abc123/inputs/votes.csv'
 *
 * generateSnapshotInputKey('abc123', 'config', 'json')
 * // Returns: 'snapshots/abc123/inputs/config.json'
 * ```
 */
export function generateSnapshotInputKey(snapshotId: string, inputName: string, ext = 'csv'): string {
  return `snapshots/${snapshotId}/inputs/${inputName}.${ext}`;
}

/**
 * Generates an S3 key for a snapshot output file.
 *
 * The generated key follows the pattern: `snapshots/{snapshotId}/outputs/{algorithmKey}.{ext}`
 *
 * @param snapshotId - Unique identifier of the snapshot
 * @param algorithmKey - Algorithm key that produces this output (e.g., 'voting_engagement')
 * @param ext - File extension without the dot (defaults to 'csv')
 * @returns S3 key path
 *
 * @example
 * ```typescript
 * generateSnapshotOutputKey('abc123', 'voting_engagement')
 * // Returns: 'snapshots/abc123/outputs/voting_engagement.csv'
 *
 * generateSnapshotOutputKey('abc123', 'results', 'json')
 * // Returns: 'snapshots/abc123/outputs/results.json'
 * ```
 */
export function generateSnapshotOutputKey(snapshotId: string, algorithmKey: string, ext = 'csv'): string {
  return `snapshots/${snapshotId}/outputs/${algorithmKey}.${ext}`;
}

/**
 * Detects the type of a storage key based on its path prefix.
 *
 * @param key - S3 key to analyze
 * @returns The detected key type, or null if the pattern is unrecognized
 *
 * @example
 * ```typescript
 * detectKeyType('uploads/1732147200/votes.csv')
 * // Returns: 'upload'
 *
 * detectKeyType('snapshots/abc123/inputs/votes.csv')
 * // Returns: 'snapshot-input'
 *
 * detectKeyType('snapshots/abc123/outputs/voting_engagement.csv')
 * // Returns: 'snapshot-output'
 *
 * detectKeyType('unknown/path/file.txt')
 * // Returns: null
 * ```
 */
export function detectKeyType(key: string): StorageKeyType | null {
  if (key.startsWith('uploads/')) {
    return 'upload';
  }

  if (key.startsWith('snapshots/')) {
    const parts = key.split('/');
    if (parts.length >= 4) {
      if (parts[2] === 'inputs') {
        return 'snapshot-input';
      }
      if (parts[2] === 'outputs') {
        return 'snapshot-output';
      }
    }
  }

  return null;
}

/**
 * Parses a storage key into its component parts.
 *
 * Supports all key patterns:
 * - Uploads: `uploads/{timestamp}/{filename}.{ext}`
 * - Snapshot inputs: `snapshots/{snapshotId}/inputs/{inputName}.{ext}`
 * - Snapshot outputs: `snapshots/{snapshotId}/outputs/{algorithmKey}.{ext}`
 *
 * @param key - S3 key to parse
 * @returns Parsed key components with type discrimination
 * @throws {InvalidStorageKeyError} If the key format is invalid
 *
 * @example
 * ```typescript
 * parseStorageKey('uploads/1732147200/votes.csv')
 * // Returns: {
 * //   type: 'upload',
 * //   filename: 'votes.csv',
 * //   ext: 'csv',
 * //   timestamp: 1732147200
 * // }
 *
 * parseStorageKey('snapshots/abc123/inputs/votes.csv')
 * // Returns: {
 * //   type: 'snapshot-input',
 * //   filename: 'votes.csv',
 * //   ext: 'csv',
 * //   snapshotId: 'abc123',
 * //   inputName: 'votes'
 * // }
 *
 * parseStorageKey('snapshots/abc123/outputs/voting_engagement.csv')
 * // Returns: {
 * //   type: 'snapshot-output',
 * //   filename: 'voting_engagement.csv',
 * //   ext: 'csv',
 * //   snapshotId: 'abc123',
 * //   algorithmKey: 'voting_engagement'
 * // }
 * ```
 */
export function parseStorageKey(key: string): ParsedStorageKey {
  const keyType = detectKeyType(key);

  if (!keyType) {
    throw new InvalidStorageKeyError(
      key,
      'Key must start with "uploads/" or "snapshots/{id}/inputs/" or "snapshots/{id}/outputs/"',
    );
  }

  const parts = key.split('/');

  if (keyType === 'upload') {
    return parseUploadKey(key, parts);
  }

  if (keyType === 'snapshot-input') {
    return parseSnapshotInputKey(key, parts);
  }

  return parseSnapshotOutputKey(key, parts);
}

/**
 * Parses an upload key into its components.
 * @internal
 */
function parseUploadKey(key: string, parts: string[]): ParsedStorageKey {
  if (parts.length < 3) {
    throw new InvalidStorageKeyError(key, 'Upload key must have at least 3 path segments');
  }

  const timestampSegment = parts[1];
  if (!timestampSegment) {
    throw new InvalidStorageKeyError(key, 'Missing timestamp segment');
  }

  const timestamp = Number.parseInt(timestampSegment, 10);
  if (Number.isNaN(timestamp)) {
    throw new InvalidStorageKeyError(key, `Invalid timestamp: ${timestampSegment}`);
  }

  const filenamePart = parts.slice(2).join('/');
  const { name, ext } = extractFilenameAndExt(key, filenamePart);

  return {
    type: 'upload',
    filename: `${name}.${ext}`,
    ext,
    timestamp,
  };
}

/**
 * Parses a snapshot input key into its components.
 * @internal
 */
function parseSnapshotInputKey(key: string, parts: string[]): ParsedStorageKey {
  if (parts.length < 4) {
    throw new InvalidStorageKeyError(key, 'Snapshot input key must have at least 4 path segments');
  }

  const snapshotId = parts[1];
  if (!snapshotId) {
    throw new InvalidStorageKeyError(key, 'Missing snapshotId segment');
  }

  const filenamePart = parts.slice(3).join('/');
  const { name, ext } = extractFilenameAndExt(key, filenamePart);

  return {
    type: 'snapshot-input',
    filename: `${name}.${ext}`,
    ext,
    snapshotId,
    inputName: name,
  };
}

/**
 * Parses a snapshot output key into its components.
 * @internal
 */
function parseSnapshotOutputKey(key: string, parts: string[]): ParsedStorageKey {
  if (parts.length < 4) {
    throw new InvalidStorageKeyError(key, 'Snapshot output key must have at least 4 path segments');
  }

  const snapshotId = parts[1];
  if (!snapshotId) {
    throw new InvalidStorageKeyError(key, 'Missing snapshotId segment');
  }

  const filenamePart = parts.slice(3).join('/');
  const { name, ext } = extractFilenameAndExt(key, filenamePart);

  return {
    type: 'snapshot-output',
    filename: `${name}.${ext}`,
    ext,
    snapshotId,
    algorithmKey: name,
  };
}

/**
 * Extracts filename and extension from a file path segment.
 * @internal
 */
function extractFilenameAndExt(key: string, filenamePart: string): { name: string; ext: string } {
  const lastDotIndex = filenamePart.lastIndexOf('.');

  if (lastDotIndex === -1) {
    throw new InvalidStorageKeyError(key, 'No file extension found');
  }

  return {
    name: filenamePart.substring(0, lastDotIndex),
    ext: filenamePart.substring(lastDotIndex + 1),
  };
}
