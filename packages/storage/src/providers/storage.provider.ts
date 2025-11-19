/**
 * @reputo/storage/providers/storage
 *
 * Generic storage provider interface.
 */

import type { ProviderMetadata } from '../shared/types/index.js';

/**
 * Generic storage provider interface.
 *
 * All storage providers (S3, Azure, GCS, etc.) must implement this interface.
 */
export interface StorageProvider {
  /**
   * Retrieves metadata for an object.
   *
   * @param key - Storage key of the object
   * @returns Promise resolving to provider metadata
   * @throws {ObjectNotFoundError} If object doesn't exist
   * @throws {HeadObjectFailedError} If metadata retrieval fails
   */
  getMetadata(key: string): Promise<ProviderMetadata>;

  /**
   * Generates a presigned URL for uploading an object.
   *
   * @param key - Storage key where the object will be stored
   * @param contentType - MIME type of the object
   * @param ttlSeconds - Time-to-live for the URL in seconds
   * @returns Promise resolving to presigned upload URL
   */
  createUploadUrl(key: string, contentType: string, ttlSeconds: number): Promise<string>;

  /**
   * Generates a presigned URL for downloading an object.
   *
   * @param key - Storage key of the object to download
   * @param ttlSeconds - Time-to-live for the URL in seconds
   * @returns Promise resolving to presigned download URL
   * @throws {ObjectNotFoundError} If object doesn't exist
   */
  createDownloadUrl(key: string, ttlSeconds: number): Promise<string>;

  /**
   * Reads an object and returns its contents.
   *
   * @param key - Storage key of the object to read
   * @returns Promise resolving to object contents as Buffer
   * @throws {ObjectNotFoundError} If object doesn't exist
   */
  read(key: string): Promise<Buffer>;

  /**
   * Writes an object to storage.
   *
   * @param key - Storage key where the object will be stored
   * @param body - Object contents
   * @param contentType - Optional MIME type
   * @returns Promise that resolves when write completes
   */
  write(key: string, body: Buffer | Uint8Array | string, contentType?: string): Promise<void>;
}
