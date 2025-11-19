/**
 * @reputo/storage/shared/utils/keys
 *
 * Utilities for generating and parsing storage keys.
 */

import { InvalidStorageKeyError } from '../errors/index.js';
import type { ParsedStorageKey } from '../types/index.js';

const EXTENSION_MAP: Record<string, string> = {
  'text/csv': 'csv',
  'text/plain': 'txt',
  'application/json': 'json',
  'application/octet-stream': 'bin',
};

function getExtensionFromContentType(contentType: string): string {
  return EXTENSION_MAP[contentType] ?? 'bin';
}

function sanitizeFilename(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
  const sanitized = nameWithoutExt.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
  return sanitized.slice(0, 200) || 'file';
}

/**
 * Generates a storage key for uploading a file.
 *
 * @param filename - Original filename
 * @param contentType - MIME type
 * @param now - Optional Date object for timestamp generation
 * @returns Storage key path
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
 * @param key - Storage key to parse
 * @returns Parsed key components
 * @throws {InvalidStorageKeyError} If the key format is invalid
 */
export function parseStorageKey(key: string): ParsedStorageKey {
  const parts = key.split('/');

  if (parts.length < 3 || parts[0] !== 'uploads') {
    throw new InvalidStorageKeyError(key, 'Key must start with "uploads/" and contain at least 3 path segments');
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
