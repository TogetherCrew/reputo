/**
 * @reputo/storage/shared/utils/keys
 *
 * Utilities for generating and parsing S3 storage keys.
 * Keys follow the convention: uploads/{timestamp}/{sanitized-filename}.{ext}
 */

import { InvalidStorageKeyError } from '../errors/index.js';
import type { ParsedStorageKey } from '../types/index.js';

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
 * Parses a storage key into its component parts.
 *
 * Expects keys in the format: `uploads/{timestamp}/{filename}.{ext}`
 *
 * @param key - S3 key to parse
 * @returns Parsed key components
 * @throws {InvalidStorageKeyError} If the key format is invalid
 *
 * @example
 * ```typescript
 * parseStorageKey('uploads/1732147200/votes.csv')
 * // Returns: {
 * //   filename: 'votes.csv',
 * //   ext: 'csv',
 * //   timestamp: 1732147200
 * // }
 * ```
 */
export function parseStorageKey(key: string): ParsedStorageKey {
  const parts = key.split('/');

  if (parts.length < 3 || parts[0] !== 'uploads') {
    throw new InvalidStorageKeyError(key, 'Key must start with "uploads/" and contain at least 3 path segments');
  }

  // TypeScript doesn't know that parts[1] exists after the length check
  // We've already validated parts.length >= 3, so parts[1] is guaranteed to exist
  const timestampSegment = parts[1];
  if (!timestampSegment) {
    throw new InvalidStorageKeyError(key, 'Missing timestamp segment');
  }

  const timestamp = Number.parseInt(timestampSegment, 10);
  if (Number.isNaN(timestamp)) {
    throw new InvalidStorageKeyError(key, `Invalid timestamp: ${timestampSegment}`);
  }

  // Rejoin all parts after the timestamp (handles nested paths)
  const filenamePart = parts.slice(2).join('/');
  const lastDotIndex = filenamePart.lastIndexOf('.');

  if (lastDotIndex === -1) {
    throw new InvalidStorageKeyError(key, 'No file extension found');
  }

  const filename = filenamePart.substring(0, lastDotIndex);
  const ext = filenamePart.substring(lastDotIndex + 1);

  return {
    filename: `${filename}.${ext}`,
    ext,
    timestamp,
  };
}
