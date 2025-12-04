/**
 * @reputo/storage
 *
 * Framework-agnostic S3 storage abstraction.
 */

import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  FileTooLargeError,
  HeadObjectFailedError,
  InvalidContentTypeError,
  ObjectNotFoundError,
} from './shared/errors/index.js';
import type {
  ParsedStorageKey,
  PresignedDownload,
  PresignedUpload,
  StorageConfig,
  StorageMetadata,
} from './shared/types/index.js';
import { detectKeyType, generateUploadKey, parseStorageKey } from './shared/utils/keys.js';

/**
 * Main storage class that wraps an S3Client instance.
 *
 * Provides a high-level API for:
 * - Generating presigned URLs for uploads and downloads
 * - Verifying uploaded files against size and content-type policies
 * - Reading and writing objects directly
 *
 * The Storage instance does NOT create its own S3Client.
 * Applications must inject a configured S3Client instance.
 *
 * @example
 * ```typescript
 * import { S3Client } from '@aws-sdk/client-s3';
 * import { Storage } from '@reputo/storage';
 *
 * const s3Client = new S3Client({ region: 'us-east-1' });
 * const storage = new Storage({
 *   bucket: 'my-bucket',
 *   presignPutTtl: 3600,
 *   presignGetTtl: 900,
 *   maxSizeBytes: 104857600, // 100 MB
 *   contentTypeAllowlist: ['text/csv', 'application/json'],
 * }, s3Client);
 *
 * // Generate upload URL
 * const upload = await storage.presignPut('data.csv', 'text/csv');
 * console.log(upload.key, upload.url);
 *
 * // Verify upload and get metadata
 * const result = await storage.verifyUpload(upload.key);
 * console.log(result.metadata);
 *
 * // Generate download URL
 * const download = await storage.presignGet(upload.key);
 * console.log(download.url);
 * ```
 */
export class Storage {
  private readonly bucket: string;
  private readonly presignPutTtl: number;
  private readonly presignGetTtl: number;
  private readonly maxSizeBytes: number;
  private readonly contentTypeAllowlist: Set<string>;

  /**
   * Creates a new Storage instance.
   *
   * @param config - Storage configuration options
   * @param s3Client - Configured S3Client instance to use for all operations
   */
  constructor(
    config: StorageConfig,
    private readonly s3Client: S3Client,
  ) {
    this.bucket = config.bucket;
    this.presignPutTtl = config.presignPutTtl;
    this.presignGetTtl = config.presignGetTtl;
    this.maxSizeBytes = config.maxSizeBytes;
    this.contentTypeAllowlist = new Set(config.contentTypeAllowlist);
  }

  /**
   * Generates a presigned URL for uploading a file.
   *
   * The client can use this URL to upload the file directly to S3
   * without going through your application server.
   *
   * @param filename - Original filename (will be sanitized)
   * @param contentType - MIME type of the file
   * @returns Upload information including the key and presigned URL
   * @throws {InvalidContentTypeError} If content type is not in allowlist
   *
   * @example
   * ```typescript
   * const result = await storage.presignPut('votes.csv', 'text/csv');
   * // result.key: 'uploads/1732147200/votes.csv'
   * // result.url: 'https://bucket.s3.amazonaws.com/...'
   * // result.expiresIn: 3600
   * ```
   */
  async presignPut(filename: string, contentType: string): Promise<PresignedUpload> {
    this.validateContentType(contentType);

    const key = generateUploadKey(filename, contentType);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.presignPutTtl,
    });

    return {
      key,
      url,
      expiresIn: this.presignPutTtl,
    };
  }

  /**
   * Verifies that a file meets size requirements and optionally content-type policies.
   *
   * Supports all key patterns:
   * - Upload keys (`uploads/...`): validates size AND content type against allowlist
   * - Snapshot keys (`snapshots/...`): validates size only (internal use)
   *
   * @param key - S3 key of the object to verify
   * @returns Verification result with metadata
   * @throws {ObjectNotFoundError} If the object doesn't exist
   * @throws {HeadObjectFailedError} If metadata retrieval fails
   * @throws {FileTooLargeError} If file exceeds max size
   * @throws {InvalidContentTypeError} If content type is not allowed (upload keys only)
   *
   * @example
   * ```typescript
   * // Verify an upload (validates content type)
   * const result = await storage.verify('uploads/1732147200/votes.csv');
   *
   * // Verify a snapshot output (skips content type validation)
   * const result = await storage.verify('snapshots/abc123/outputs/voting_engagement.csv');
   * ```
   */
  async verify(key: string): Promise<{ key: string; metadata: StorageMetadata }> {
    const head = await this.getObjectMetadata(key);

    const size = head.ContentLength ?? 0;
    const contentType = head.ContentType ?? 'application/octet-stream';

    // Always validate file size
    this.validateFileSize(size);

    // Only validate content type for user uploads (not internal snapshot files)
    const keyType = detectKeyType(key);
    if (keyType === 'upload') {
      this.validateContentType(contentType);
    }

    const parsed = parseStorageKey(key);
    const timestamp = this.getTimestampFromParsedKey(parsed);

    return {
      key,
      metadata: {
        filename: parsed.filename,
        ext: parsed.ext,
        size,
        contentType,
        timestamp,
      },
    };
  }

  /**
   * @deprecated Use {@link verify} instead. This method is kept for backward compatibility.
   */
  async verifyUpload(key: string): Promise<{ key: string; metadata: StorageMetadata }> {
    return this.verify(key);
  }

  /**
   * Generates a presigned URL for downloading a file.
   *
   * Supports all key patterns:
   * - Upload keys: `uploads/{timestamp}/{filename}.{ext}`
   * - Snapshot inputs: `snapshots/{snapshotId}/inputs/{inputName}.{ext}`
   * - Snapshot outputs: `snapshots/{snapshotId}/outputs/{algorithmKey}.{ext}`
   *
   * For upload keys, the timestamp is extracted from the key path.
   * For snapshot keys, the timestamp is set to the current Unix timestamp.
   *
   * @param key - S3 key of the object to download
   * @returns Download information including presigned URL and metadata
   * @throws {ObjectNotFoundError} If the object doesn't exist
   * @throws {HeadObjectFailedError} If metadata retrieval fails
   *
   * @example
   * ```typescript
   * // Download an upload
   * const result = await storage.presignGet('uploads/1732147200/votes.csv');
   *
   * // Download a snapshot output
   * const result = await storage.presignGet('snapshots/abc123/outputs/voting_engagement.csv');
   * ```
   */
  async presignGet(key: string): Promise<PresignedDownload> {
    const head = await this.getObjectMetadata(key);

    const size = head.ContentLength ?? 0;
    const contentType = head.ContentType ?? 'application/octet-stream';

    const parsed = parseStorageKey(key);
    const timestamp = this.getTimestampFromParsedKey(parsed);

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.presignGetTtl,
    });

    return {
      url,
      expiresIn: this.presignGetTtl,
      metadata: {
        filename: parsed.filename,
        ext: parsed.ext,
        size,
        contentType,
        timestamp,
      },
    };
  }

  /**
   * @deprecated Use {@link presignGet} instead. This method is kept for backward compatibility.
   */
  async presignGetForKey(key: string): Promise<PresignedDownload> {
    return this.presignGet(key);
  }

  /**
   * Reads an object from S3 and returns its contents as a Buffer.
   *
   * Use this for server-side object reads. For client downloads,
   * use presignGet() to generate a download URL instead.
   *
   * @param key - S3 key of the object to read
   * @returns Object contents as a Buffer
   * @throws {ObjectNotFoundError} If the object doesn't exist
   *
   * @example
   * ```typescript
   * const buffer = await storage.getObject('uploads/1732147200/votes.csv');
   * const text = buffer.toString('utf-8');
   * console.log(text);
   * ```
   */
  async getObject(key: string): Promise<Buffer> {
    try {
      const result = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      const chunks: Buffer[] = [];
      // @ts-expect-error - Body type varies by runtime (Node.js vs browser)
      for await (const chunk of result.Body) {
        chunks.push(Buffer.from(chunk as Buffer));
      }

      return Buffer.concat(chunks);
    } catch (error: unknown) {
      const err = error as {
        name?: string;
        $metadata?: { httpStatusCode?: number };
      };

      if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
        throw new ObjectNotFoundError(key);
      }

      throw error;
    }
  }

  /**
   * Writes an object to S3.
   *
   * Use this for server-side uploads. For client uploads,
   * use presignPut() to generate an upload URL instead.
   *
   * Content type validation is only applied for upload keys (`uploads/...`).
   * Snapshot keys (`snapshots/...`) bypass content type validation for internal use.
   *
   * @param key - S3 key where the object should be stored
   * @param body - Object contents (Buffer, Uint8Array, or string)
   * @param contentType - Optional MIME type (validated for upload keys only)
   * @returns The key of the stored object
   * @throws {InvalidContentTypeError} If content type is not allowed (upload keys only)
   *
   * @example
   * ```typescript
   * // Upload with content type validation
   * const csvData = 'name,score\nAlice,100\nBob,95';
   * const key = 'uploads/1732147200/results.csv';
   * await storage.putObject(key, csvData, 'text/csv');
   *
   * // Snapshot output (skips content type validation)
   * const outputKey = 'snapshots/abc123/outputs/voting_engagement.csv';
   * await storage.putObject(outputKey, csvData, 'text/csv');
   * ```
   */
  async putObject(key: string, body: Buffer | Uint8Array | string, contentType?: string): Promise<string> {
    // Only validate content type for user uploads (not internal snapshot files)
    const keyType = detectKeyType(key);
    if (contentType && keyType === 'upload') {
      this.validateContentType(contentType);
    }

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return key;
  }

  /**
   * Validates that a file size is within the allowed maximum.
   *
   * @param size - File size in bytes
   * @throws {FileTooLargeError} If size exceeds maxSizeBytes
   *
   * @private
   */
  private validateFileSize(size: number): void {
    if (size > this.maxSizeBytes) {
      throw new FileTooLargeError(this.maxSizeBytes);
    }
  }

  /**
   * Validates that a content type is in the allowlist.
   *
   * @param contentType - MIME type to validate
   * @throws {InvalidContentTypeError} If content type is not allowed
   *
   * @private
   */
  private validateContentType(contentType: string): void {
    if (!this.contentTypeAllowlist.has(contentType)) {
      throw new InvalidContentTypeError(contentType, [...this.contentTypeAllowlist]);
    }
  }

  /**
   * Extracts timestamp from a parsed storage key.
   *
   * For upload keys, returns the timestamp from the key path.
   * For snapshot keys, returns the current Unix timestamp.
   *
   * @param parsed - Parsed storage key
   * @returns Unix timestamp in seconds
   *
   * @private
   */
  private getTimestampFromParsedKey(parsed: ParsedStorageKey): number {
    if (parsed.type === 'upload') {
      return parsed.timestamp;
    }

    // For snapshot keys, use current timestamp
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Retrieves object metadata using a HEAD request.
   *
   * @param key - S3 key of the object
   * @returns S3 HeadObject response
   * @throws {ObjectNotFoundError} If object doesn't exist
   * @throws {HeadObjectFailedError} If metadata retrieval fails
   *
   * @private
   */
  private async getObjectMetadata(key: string) {
    try {
      return await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error: unknown) {
      const err = error as {
        name?: string;
        $metadata?: { httpStatusCode?: number };
      };

      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        throw new ObjectNotFoundError(key);
      }

      throw new HeadObjectFailedError(key);
    }
  }
}
