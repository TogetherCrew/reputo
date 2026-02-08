/**
 * @reputo/storage
 *
 * Framework-agnostic S3 storage layer for the Reputo ecosystem.
 * Provides a reusable abstraction over S3 with type-safe operations,
 * presigned URLs, and configurable constraints.
 */

// Export S3 client factory
export { createS3Client, type S3ClientConfig } from './s3-client.js';
// Export shared utilities
export * from './shared/index.js';

// Export main Storage class
export { Storage } from './storage.js';
