import { S3Client } from '@aws-sdk/client-s3';
import { Storage } from '@reputo/storage';
import type { Config } from './config/index.js';

export function createS3Client(config: Config): S3Client {
  const s3ClientConfig: ConstructorParameters<typeof S3Client>[0] = {
    region: config.storage.awsRegion,
  };

  if (config.app.nodeEnv !== 'production' && config.storage.awsAccessKeyId && config.storage.awsSecretAccessKey) {
    s3ClientConfig.credentials = {
      accessKeyId: config.storage.awsAccessKeyId,
      secretAccessKey: config.storage.awsSecretAccessKey,
    };
  }

  return new S3Client(s3ClientConfig);
}

export function createStorage(config: Config, s3Client: S3Client): Storage {
  return new Storage(
    {
      bucket: config.storage.bucket,
      presignPutTtl: 3600,
      presignGetTtl: 900,
      maxSizeBytes: config.storage.maxSizeBytes,
      contentTypeAllowlist: config.storage.contentTypeAllowlist,
    },
    s3Client,
  );
}
