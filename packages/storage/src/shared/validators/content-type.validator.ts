/**
 * @reputo/storage/shared/validators/content-type
 *
 * Content type validation utilities.
 */

import { InvalidContentTypeError } from '../errors/index.js';

/**
 * Validates that a content type is in the allowlist.
 *
 * @param contentType - MIME type to validate
 * @param allowlist - Set or array of allowed content types
 * @throws {InvalidContentTypeError} If content type is not allowed
 */
export function validateContentType(contentType: string, allowlist: Set<string> | readonly string[]): void {
  const isAllowed = allowlist instanceof Set ? allowlist.has(contentType) : allowlist.includes(contentType);

  if (!isAllowed) {
    const allowedTypes = allowlist instanceof Set ? [...allowlist] : [...allowlist];
    throw new InvalidContentTypeError(contentType, allowedTypes);
  }
}
