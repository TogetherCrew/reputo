import { GetObjectCommand, HeadObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { HeadObjectFailedError, ObjectNotFoundError } from '../shared/errors/index.js';
import type { DownloadUrlResult } from '../shared/types/index.js';
import { parseStorageKey } from '../shared/utils/keys.js';

export interface PresignGetOptions {
  bucket: string;
  key: string;
  ttl: number;
}

export interface GetObjectOptions {
  bucket: string;
  key: string;
}

export async function presignGet(s3Client: S3Client, options: PresignGetOptions): Promise<DownloadUrlResult> {
  const { bucket, key, ttl } = options;

  try {
    const response = await s3Client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    const size = response.ContentLength ?? 0;
    const contentType = response.ContentType ?? 'application/octet-stream';
    const { filename, ext, timestamp } = parseStorageKey(key);

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: ttl,
    });

    return {
      url,
      expiresIn: ttl,
      metadata: {
        filename,
        ext,
        size,
        contentType,
        timestamp,
      },
    };
  } catch (error: unknown) {
    handleS3Error(error, key);
  }
}

export async function getObject(s3Client: S3Client, options: GetObjectOptions): Promise<Buffer> {
  const { bucket, key } = options;

  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    const chunks: Buffer[] = [];
    // @ts-expect-error 
    for await (const chunk of response.Body) {
      chunks.push(Buffer.from(chunk as Buffer));
    }

    return Buffer.concat(chunks);
  } catch (error: unknown) {
    handleS3Error(error, key);
  }
}

function handleS3Error(error: unknown, key: string): never {
  const err = error as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };

  if (err.name === 'NoSuchKey' || err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
    throw new ObjectNotFoundError(key);
  }

  throw new HeadObjectFailedError(key);
}

