/**
 * @reputo/storage/services/storage-io
 *
 * Consolidated service for all storage I/O operations.
 * Handles uploads, downloads, reads, and writes.
 */

import type { StorageIOConfig } from '../config/index.js';
import type { StorageProvider } from '../providers/storage.provider.js';
import { generateUploadKey, parseStorageKey } from '../shared/utils/keys.js';
import { validateContentType } from '../shared/validators/index.js';
import type { DownloadUrlResult, UploadUrlResult } from './storage-io.types.js';

/**
 * Service for storage I/O operations.
 *
 * Handles uploads, downloads, reads, and writes using the StorageProvider interface.
 */
export class StorageIOService {
  /**
   * Creates a new StorageIOService instance.
   *
   * @param provider - Storage provider implementation
   * @param config - I/O operation configuration
   */
  constructor(
    private readonly provider: StorageProvider,
    private readonly config: StorageIOConfig,
  ) {}

  /**
   * Generates a presigned URL for uploading a file.
   *
   * @param filename - Original filename (will be sanitized)
   * @param contentType - MIME type of the file
   * @returns Upload information including the key and presigned URL
   * @throws {InvalidContentTypeError} If content type is not in allowlist
   */
  async generateUploadUrl(filename: string, contentType: string): Promise<UploadUrlResult> {
    validateContentType(contentType, this.config.allowedContentTypes);

    const key = generateUploadKey(filename, contentType);

    const url = await this.provider.createUploadUrl(key, contentType, this.config.uploadTtlSeconds);

    return {
      key,
      url,
      expiresIn: this.config.uploadTtlSeconds,
    };
  }

  /**
   * Generates a presigned URL for downloading a file.
   *
   * @param key - Storage key of the object to download
   * @returns Download information including presigned URL and metadata
   * @throws {ObjectNotFoundError} If the object doesn't exist
   * @throws {HeadObjectFailedError} If metadata retrieval fails
   */
  async generateDownloadUrl(key: string): Promise<DownloadUrlResult> {
    const providerMeta = await this.provider.getMetadata(key);
    const { filename, ext, timestamp } = parseStorageKey(key);

    const url = await this.provider.createDownloadUrl(key, this.config.downloadTtlSeconds);

    return {
      url,
      expiresIn: this.config.downloadTtlSeconds,
      metadata: {
        filename,
        ext,
        size: providerMeta.size,
        contentType: providerMeta.contentType,
        timestamp,
      },
    };
  }

  /**
   * Reads an object and returns its contents as a Buffer.
   *
   * @param key - Storage key of the object to read
   * @returns Object contents as a Buffer
   * @throws {ObjectNotFoundError} If the object doesn't exist
   */
  async readObject(key: string): Promise<Buffer> {
    return this.provider.read(key);
  }

  /**
   * Writes an object to storage.
   *
   * @param key - Storage key where the object should be stored
   * @param body - Object contents (Buffer, Uint8Array, or string)
   * @param contentType - Optional MIME type (validated if provided)
   * @returns The key of the stored object
   * @throws {InvalidContentTypeError} If content type is provided and not allowed
   */
  async writeObject(key: string, body: Buffer | Uint8Array | string, contentType?: string): Promise<string> {
    if (contentType) {
      validateContentType(contentType, this.config.allowedContentTypes);
    }

    await this.provider.write(key, body, contentType);
    return key;
  }
}
