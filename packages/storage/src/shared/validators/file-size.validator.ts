import { FileTooLargeError } from '../errors/index.js';

export function validateFileSize(size: number, maxSizeBytes: number): void {
  if (size > maxSizeBytes) {
    throw new FileTooLargeError(maxSizeBytes);
  }
}
