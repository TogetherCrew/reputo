/**
 * @reputo/storage
 *
 * Framework-agnostic S3 storage abstraction.
 */

import type { S3Client } from '@aws-sdk/client-s3';
import { createIOConfig, createVerificationConfig, type StorageConfig } from './config/index.js';
import { S3Provider } from './providers/index.js';
import type { DownloadUrlResult, UploadUrlResult, VerificationResult } from './services/index.js';
import { StorageIOService, VerificationService } from './services/index.js';

/**
 * Main storage class that provides a high-level API for storage operations.
 *
 * This class serves as a facade over the provider and service layers.
 * It maintains backward compatibility while using the new modular architecture.
 *
 * The Storage instance:
 * - Creates an S3Provider from the injected S3Client
 * - Initializes StorageIOService and VerificationService
 * - Delegates all operations to these services
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
  private readonly ioService: StorageIOService;
  private readonly verificationService: VerificationService;

  /**
   * Creates a new Storage instance.
   *
   * Internally creates an S3Provider and initializes services.
   *
   * @param config - Storage configuration options
   * @param s3Client - Configured S3Client instance to use for all operations
   */
  constructor(config: StorageConfig, s3Client: S3Client) {
    // Create S3 provider
    const provider = new S3Provider({
      client: s3Client,
      bucket: config.bucket,
    });

    // Create service configs
    const ioConfig = createIOConfig(config);
    const verificationConfig = createVerificationConfig(config);

    // Initialize services
    this.ioService = new StorageIOService(provider, ioConfig);
    this.verificationService = new VerificationService(provider, verificationConfig);
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
  async presignPut(filename: string, contentType: string): Promise<UploadUrlResult> {
    return this.ioService.generateUploadUrl(filename, contentType);
  }

  /**
   * Verifies that an uploaded file meets size and content-type requirements.
   *
   * This should be called after a client uploads to a presigned URL
   * to confirm the upload was successful and meets policy constraints.
   *
   * @param key - S3 key of the uploaded object
   * @returns Upload verification result with metadata
   * @throws {ObjectNotFoundError} If the object doesn't exist
   * @throws {HeadObjectFailedError} If metadata retrieval fails
   * @throws {FileTooLargeError} If file exceeds max size
   * @throws {InvalidContentTypeError} If content type is not allowed
   *
   * @example
   * ```typescript
   * const result = await storage.verifyUpload('uploads/1732147200/votes.csv');
   * // result.key: 'uploads/1732147200/votes.csv'
   * // result.metadata: {
   * //   filename: 'votes.csv',
   * //   ext: 'csv',
   * //   size: 1024,
   * //   contentType: 'text/csv',
   * //   timestamp: 1732147200
   * // }
   * ```
   */
  async verifyUpload(key: string): Promise<VerificationResult> {
    return this.verificationService.verifyUpload(key);
  }

  /**
   * Generates a presigned URL for downloading a file.
   *
   * The URL is valid for the duration specified in presignGetTtl.
   * Also returns metadata about the object.
   *
   * @param key - S3 key of the object to download
   * @returns Download information including presigned URL and metadata
   * @throws {ObjectNotFoundError} If the object doesn't exist
   * @throws {HeadObjectFailedError} If metadata retrieval fails
   *
   * @example
   * ```typescript
   * const result = await storage.presignGet('uploads/1732147200/votes.csv');
   * // result.url: 'https://bucket.s3.amazonaws.com/...'
   * // result.expiresIn: 900
   * // result.metadata: { filename: 'votes.csv', ... }
   * ```
   */
  async presignGet(key: string): Promise<DownloadUrlResult> {
    return this.ioService.generateDownloadUrl(key);
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
    return this.ioService.readObject(key);
  }

  /**
   * Writes an object to S3.
   *
   * Use this for server-side uploads. For client uploads,
   * use presignPut() to generate an upload URL instead.
   *
   * @param key - S3 key where the object should be stored
   * @param body - Object contents (Buffer, Uint8Array, or string)
   * @param contentType - Optional MIME type (validated if provided)
   * @returns The key of the stored object
   * @throws {InvalidContentTypeError} If content type is provided and not allowed
   *
   * @example
   * ```typescript
   * const csvData = 'name,score\nAlice,100\nBob,95';
   * const key = 'uploads/1732147200/results.csv';
   * await storage.putObject(key, csvData, 'text/csv');
   * ```
   */
  async putObject(key: string, body: Buffer | Uint8Array | string, contentType?: string): Promise<string> {
    return this.ioService.writeObject(key, body, contentType);
  }
}
