import { PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { UploadUrlResult } from '../shared/types/index.js';
import { generateUploadKey } from '../shared/utils/keys.js';
import { validateContentType } from '../shared/validators/index.js';

export interface PresignPutOptions {
  bucket: string;
  filename: string;
  contentType: string;
  ttl: number;
  allowedTypes: readonly string[];
}

export interface PutObjectOptions {
  bucket: string;
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
  allowedTypes: readonly string[];
}

export async function presignPut(s3Client: S3Client, options: PresignPutOptions): Promise<UploadUrlResult> {
  const { bucket, filename, contentType, ttl, allowedTypes } = options;

  validateContentType(contentType, allowedTypes);

  const key = generateUploadKey(filename, contentType);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: ttl,
  });

  return {
    key,
    url,
    expiresIn: ttl,
  };
}

export async function putObject(s3Client: S3Client, options: PutObjectOptions): Promise<string> {
  const { bucket, key, body, contentType, allowedTypes } = options;

  if (contentType) {
    validateContentType(contentType, allowedTypes);
  }

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return key;
}

