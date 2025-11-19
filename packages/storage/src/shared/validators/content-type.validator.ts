import { InvalidContentTypeError } from '../errors/index.js';

export function validateContentType(contentType: string, allowlist: Set<string> | readonly string[]): void {
  const isAllowed = allowlist instanceof Set ? allowlist.has(contentType) : allowlist.includes(contentType);

  if (!isAllowed) {
    const allowedTypes = allowlist instanceof Set ? [...allowlist] : [...allowlist];
    throw new InvalidContentTypeError(contentType, allowedTypes);
  }
}
