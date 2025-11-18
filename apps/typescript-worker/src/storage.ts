import { S3Client } from '@aws-sdk/client-s3';
import { Storage, type StorageConfig as StorageLibConfig } from '@reputo/storage';
import type { Config } from './config/index.js';

/**
 * Creates an S3 client instance with the appropriate configuration.
 *
 * Credentials are handled differently based on environment:
 * - Non-production: Uses explicit AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY if provided
 * - Production: Uses IAM role (EC2/ECS/Lambda instance profile)
 *
 * @param config - Application configuration
 * @returns Configured S3Client instance
 */
export function createS3Client(config: Config): S3Client {
  const s3ClientConfig: ConstructorParameters<typeof S3Client>[0] = {
    region: config.storage.awsRegion,
  };

  // Only use explicit credentials in non-production environments
  if (
    config.app.nodeEnv !== 'production' &&
    config.storage.awsAccessKeyId &&
    config.storage.awsSecretAccessKey
  ) {
    s3ClientConfig.credentials = {
      accessKeyId: config.storage.awsAccessKeyId,
      secretAccessKey: config.storage.awsSecretAccessKey,
    };
  }

  return new S3Client(s3ClientConfig);
}

/**
 * Creates a Storage instance for algorithm I/O operations.
 *
 * @param config - Application configuration
 * @param s3Client - Configured S3Client instance
 * @returns Storage instance for algorithm inputs and outputs
 */
export function createStorage(config: Config, s3Client: S3Client): Storage {
  const storageConfig: StorageLibConfig = {
    bucket: config.storage.bucket,
    presignPutTtl: 0, // Not used in worker context
    presignGetTtl: 0, // Not used in worker context
    maxSizeBytes: config.storage.maxSizeBytes,
    contentTypeAllowlist: config.storage.contentTypeAllowlist,
  };

  return new Storage(storageConfig, s3Client);
}

