/**
 * Error codes for NotFoundError instances.
 *
 * - `KEY_NOT_FOUND`: Thrown when an algorithm key is not found in the registry
 * - `VERSION_NOT_FOUND`: Thrown when a specific version is not found for an algorithm
 */
export type NotFoundErrorCode = 'KEY_NOT_FOUND' | 'VERSION_NOT_FOUND';
