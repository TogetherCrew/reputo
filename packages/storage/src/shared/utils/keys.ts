/**
 * @reputo/storage/shared/utils/keys
 *
 * Utilities for generating and parsing S3 storage keys.
 *
 * Supported key patterns:
 * - Uploads: `uploads/{uuid}/{filename}.{ext}`
 * - Snapshots: `snapshots/{snapshotId}/{filename}.{ext}`
 */

import { InvalidStorageKeyError } from '../errors/index.js';
import type { ParsedStorageKey, StorageKeyType } from '../types/index.js';

/**
 * Generates an S3 storage key.
 *
 * @param type - Type of key to generate ('upload' or 'snapshot')
 * @param id - Unique identifier (UUID for uploads, snapshotId for snapshots)
 * @param filename - Filename (should include extension if needed, e.g., 'data.csv')
 * @returns S3 key path
 *
 * @example
 * ```typescript
 * // Upload key with UUID
 * generateKey('upload', randomUUID(), 'data.csv')
 * // Returns: 'uploads/{uuid}/data.csv'
 *
 * // Snapshot key
 * generateKey('snapshot', 'abc123', 'voting_engagement.csv')
 * // Returns: 'snapshots/abc123/voting_engagement.csv'
 * ```
 */
export function generateKey(type: 'upload' | 'snapshot', id: string, filename: string): string {
  if (type === 'upload') {
    return `uploads/${id}/${filename}`;
  }
  return `snapshots/${id}/${filename}`;
}

/**
 * Detects the type of a storage key based on its path prefix.
 *
 * @param key - S3 key to analyze
 * @returns The detected key type, or null if the pattern is unrecognized
 *
 * @example
 * ```typescript
 * detectKeyType('uploads/{uuid}/votes.csv')
 * // Returns: 'upload'
 *
 * detectKeyType('snapshots/abc123/voting_engagement.csv')
 * // Returns: 'snapshot'
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
    return 'snapshot';
  }

  return null;
}

/**
 * Parses a storage key into its component parts.
 *
 * Supports key patterns:
 * - Uploads: `uploads/{uuid}/{filename}.{ext}`
 * - Snapshots: `snapshots/{snapshotId}/{filename}.{ext}`
 *
 * @param key - S3 key to parse
 * @returns Parsed key components with type discrimination
 * @throws {InvalidStorageKeyError} If the key format is invalid
 *
 * @example
 * ```typescript
 * parseStorageKey('uploads/{uuid}/votes.csv')
 * // Returns: {
 * //   type: 'upload',
 * //   filename: 'votes.csv',
 * //   ext: 'csv',
 * //   uuid: '{uuid}'
 * // }
 *
 * parseStorageKey('snapshots/abc123/voting_engagement.csv')
 * // Returns: {
 * //   type: 'snapshot',
 * //   filename: 'voting_engagement.csv',
 * //   ext: 'csv',
 * //   snapshotId: 'abc123'
 * // }
 * ```
 */
export function parseStorageKey(key: string): ParsedStorageKey {
  const keyType = detectKeyType(key);

  if (!keyType) {
    throw new InvalidStorageKeyError(key, 'Key must start with "uploads/" or "snapshots/"');
  }

  const parts = key.split('/');

  if (keyType === 'upload') {
    return parseUploadKey(key, parts);
  }

  return parseSnapshotKey(key, parts);
}

/**
 * Parses an upload key into its components.
 * @internal
 */
function parseUploadKey(key: string, parts: string[]): ParsedStorageKey {
  if (parts.length < 3) {
    throw new InvalidStorageKeyError(key, 'Upload key must have at least 3 path segments');
  }

  const uuid = parts[1];
  if (!uuid) {
    throw new InvalidStorageKeyError(key, 'Missing UUID segment');
  }

  const filenamePart = parts.slice(2).join('/');
  const { name, ext } = extractFilenameAndExt(key, filenamePart);

  return {
    type: 'upload',
    filename: `${name}.${ext}`,
    ext,
    uuid,
  };
}

/**
 * Parses a snapshot key into its components.
 * @internal
 */
function parseSnapshotKey(key: string, parts: string[]): ParsedStorageKey {
  if (parts.length < 3) {
    throw new InvalidStorageKeyError(key, 'Snapshot key must have at least 3 path segments');
  }

  const snapshotId = parts[1];
  if (!snapshotId) {
    throw new InvalidStorageKeyError(key, 'Missing snapshotId segment');
  }

  const filenamePart = parts.slice(2).join('/');
  const { name, ext } = extractFilenameAndExt(key, filenamePart);

  return {
    type: 'snapshot',
    filename: `${name}.${ext}`,
    ext,
    snapshotId,
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
