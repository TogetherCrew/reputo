/**
 * @reputo/storage/providers/s3
 *
 * S3 storage provider implementation.
 * Maps S3 operations to the generic StorageProvider interface.
 */

import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { HeadObjectFailedError, ObjectNotFoundError } from '../../shared/errors/index.js';
import type { ProviderMetadata, S3ProviderConfig } from '../../shared/types/index.js';
import type { StorageProvider } from '../storage.provider.js';

/**
 * S3 implementation of the StorageProvider interface.
 *
 * Maps S3 operations to the generic provider interface and handles error mapping.
 */
export class S3Provider implements StorageProvider {
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  /**
   * Creates a new S3Provider instance.
   *
   * @param config - S3 provider configuration
   */
  constructor(config: S3ProviderConfig) {
    this.s3Client = config.client;
    this.bucket = config.bucket;
  }

  /**
   * Retrieves metadata for an S3 object.
   *
   * @param key - S3 object key
   * @returns Promise resolving to provider metadata
   * @throws {ObjectNotFoundError} If object doesn't exist
   * @throws {HeadObjectFailedError} If metadata retrieval fails
   */
  async getMetadata(key: string): Promise<ProviderMetadata> {
    try {
      const response = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      return {
        size: response.ContentLength ?? 0,
        contentType: response.ContentType ?? 'application/octet-stream',
        lastModified: response.LastModified,
        etag: response.ETag,
      };
    } catch (error: unknown) {
      this.handleS3Error(error, key);
    }
  }

  /**
   * Generates a presigned URL for uploading to S3.
   *
   * @param key - S3 object key
   * @param contentType - MIME type
   * @param ttlSeconds - URL time-to-live in seconds
   * @returns Promise resolving to presigned upload URL
   */
  async createUploadUrl(key: string, contentType: string, ttlSeconds: number): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: ttlSeconds,
    });
  }

  /**
   * Generates a presigned URL for downloading from S3.
   *
   * @param key - S3 object key
   * @param ttlSeconds - URL time-to-live in seconds
   * @returns Promise resolving to presigned download URL
   */
  async createDownloadUrl(key: string, ttlSeconds: number): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: ttlSeconds,
    });
  }

  /**
   * Reads an object from S3.
   *
   * @param key - S3 object key
   * @returns Promise resolving to object contents as Buffer
   * @throws {ObjectNotFoundError} If object doesn't exist
   */
  async read(key: string): Promise<Buffer> {
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      const chunks: Buffer[] = [];
      // @ts-expect-error - Body type varies by runtime (Node.js vs browser)
      for await (const chunk of response.Body) {
        chunks.push(Buffer.from(chunk as Buffer));
      }

      return Buffer.concat(chunks);
    } catch (error: unknown) {
      this.handleS3Error(error, key);
    }
  }

  /**
   * Writes an object to S3.
   *
   * @param key - S3 object key
   * @param body - Object contents
   * @param contentType - Optional MIME type
   * @returns Promise that resolves when write completes
   */
  async write(key: string, body: Buffer | Uint8Array | string, contentType?: string): Promise<void> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  /**
   * Maps S3 errors to domain errors.
   *
   * @param error - Unknown error from S3
   * @param key - S3 object key for context
   * @throws {ObjectNotFoundError} For 404 errors
   * @throws {HeadObjectFailedError} For all other errors
   * @private
   */
  private handleS3Error(error: unknown, key: string): never {
    const err = error as {
      name?: string;
      $metadata?: { httpStatusCode?: number };
    };

    // Map 404 errors to ObjectNotFoundError
    if (err.name === 'NoSuchKey' || err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      throw new ObjectNotFoundError(key);
    }

    // All other errors become HeadObjectFailedError
    // This includes permission errors, network errors, etc.
    throw new HeadObjectFailedError(key);
  }
}
