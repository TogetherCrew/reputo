import { HeadObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import { HeadObjectFailedError, ObjectNotFoundError } from '../shared/errors/index.js';
import type { VerificationResult } from '../shared/types/index.js';
import { parseStorageKey } from '../shared/utils/keys.js';
import { validateContentType, validateFileSize } from '../shared/validators/index.js';

export interface VerifyUploadOptions {
  bucket: string;
  key: string;
  maxSize: number;
  allowedTypes: readonly string[];
}

export async function verifyUpload(s3Client: S3Client, options: VerifyUploadOptions): Promise<VerificationResult> {
  const { bucket, key, maxSize, allowedTypes } = options;

  try {
    const response = await s3Client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    const size = response.ContentLength ?? 0;
    const contentType = response.ContentType ?? 'application/octet-stream';

    validateFileSize(size, maxSize);
    validateContentType(contentType, allowedTypes);

    const { filename, ext, timestamp } = parseStorageKey(key);

    return {
      key,
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

