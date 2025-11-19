/**
 * @reputo/storage/shared/validators/file-size
 *
 * File size validation utilities.
 */

import { FileTooLargeError } from '../errors/index.js';

/**
 * Validates that a file size is within the allowed maximum.
 *
 * @param size - File size in bytes to validate
 * @param maxSizeBytes - Maximum allowed size in bytes
 * @throws {FileTooLargeError} If size exceeds maxSizeBytes
 */
export function validateFileSize(size: number, maxSizeBytes: number): void {
  if (size > maxSizeBytes) {
    throw new FileTooLargeError(maxSizeBytes);
  }
}
