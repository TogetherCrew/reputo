/**
 * @reputo/storage/shared/types/s3
 *
 * S3-specific type definitions and interfaces.
 */

import type { S3Client } from '@aws-sdk/client-s3';

/**
 * Configuration for S3 storage provider.
 */
export interface S3ProviderConfig {
  /**
   * Configured S3Client instance.
   */
  client: S3Client;

  /**
   * S3 bucket name where objects will be stored.
   */
  bucket: string;
}

/**
 * S3-specific error metadata.
 */
export interface S3ErrorMetadata {
  /**
   * AWS error code (e.g., 'NoSuchKey', 'AccessDenied').
   */
  code?: string;

  /**
   * HTTP status code from S3 response.
   */
  statusCode?: number;

  /**
   * AWS request ID for debugging.
   */
  requestId?: string;
}
