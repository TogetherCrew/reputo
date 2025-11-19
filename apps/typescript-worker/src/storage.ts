import { S3Client } from '@aws-sdk/client-s3';
import { getObject, putObject } from '@reputo/storage';
import type { Config } from './config/index.js';

export function createS3Client(config: Config): S3Client {
  const s3ClientConfig: ConstructorParameters<typeof S3Client>[0] = {
    region: config.storage.awsRegion,
  };

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

export interface Storage {
  getObject(key: string): Promise<Buffer>;
  putObject(key: string, body: Buffer | Uint8Array | string, contentType?: string): Promise<string>;
}

export function createStorage(config: Config, s3Client: S3Client): Storage {
  return {
    async getObject(key: string): Promise<Buffer> {
      return getObject(s3Client, {
        bucket: config.storage.bucket,
        key,
      });
    },
    async putObject(key: string, body: Buffer | Uint8Array | string, contentType?: string): Promise<string> {
      return putObject(s3Client, {
        bucket: config.storage.bucket,
        key,
        body,
        contentType,
        allowedTypes: config.storage.contentTypeAllowlist,
      });
    },
  };
}
