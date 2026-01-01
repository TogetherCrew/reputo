/**
 * S3 storage helper utilities for the DeepFunding Portal data sync example
 *
 * Provides functions to create a Storage instance for S3 operations.
 */

import type { S3Client } from '@aws-sdk/client-s3';
import { Storage } from '@reputo/storage';
import { S3_CONFIG } from './config.js';

/**
 * Create a Storage instance with the configured S3 client
 */
export function createStorage(s3Client: S3Client): Storage {
  return new Storage(
    {
      bucket: S3_CONFIG.bucket,
      presignPutTtl: S3_CONFIG.presignPutTtl,
      presignGetTtl: S3_CONFIG.presignGetTtl,
      maxSizeBytes: S3_CONFIG.maxSizeBytes,
      contentTypeAllowlist: [...S3_CONFIG.contentTypeAllowlist],
    },
    s3Client,
  );
}
