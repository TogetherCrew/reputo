/**
 * @reputo/storage/shared/types
 *
 * Type definitions for the storage package.
 */

/**
 * Types of storage keys supported by the system.
 *
 * - 'upload': User-uploaded files (`uploads/{uuid}/{filename}.{ext}`)
 * - 'snapshot': Snapshot files (`snapshots/{snapshotId}/{filename}.{ext}`)
 */
export type StorageKeyType = 'upload' | 'snapshot';

/**
 * Configuration options for the Storage instance.
 */
export interface StorageConfig {
  /**
   * S3 bucket name where objects will be stored.
   */
  bucket: string;

  /**
   * Time-to-live for presigned PUT URLs in seconds.
   * Controls how long upload URLs remain valid.
   */
  presignPutTtl: number;

  /**
   * Time-to-live for presigned GET URLs in seconds.
   * Controls how long download URLs remain valid.
   */
  presignGetTtl: number;

  /**
   * Maximum allowed object size in bytes.
   * Files exceeding this size will be rejected.
   */
  maxSizeBytes: number;

  /**
   * Allowed content types (MIME types) for uploads.
   * Only files with these content types will be accepted.
   *
   * @example ['text/csv', 'application/json']
   */
  contentTypeAllowlist: string[];
}

/**
 * Base fields shared by all parsed storage keys.
 */
interface ParsedStorageKeyBase {
  /**
   * Full filename including extension.
   *
   * @example 'data.csv'
   */
  filename: string;

  /**
   * File extension without the dot.
   *
   * @example 'csv'
   */
  ext: string;
}

/**
 * Parsed upload key components.
 * Pattern: `uploads/{uuid}/{filename}.{ext}`
 */
export interface ParsedUploadKey extends ParsedStorageKeyBase {
  type: 'upload';

  /**
   * UUID v4 identifier for the upload.
   */
  uuid: string;
}

/**
 * Parsed snapshot key components.
 * Pattern: `snapshots/{snapshotId}/{filename}.{ext}`
 */
export interface ParsedSnapshotKey extends ParsedStorageKeyBase {
  type: 'snapshot';

  /**
   * Unique identifier of the snapshot.
   */
  snapshotId: string;
}

/**
 * Parsed components of a storage key.
 * Discriminated union based on the `type` field.
 */
export type ParsedStorageKey = ParsedUploadKey | ParsedSnapshotKey;

/**
 * @deprecated Use ParsedStorageKey with type discrimination instead.
 * Legacy interface for backward compatibility.
 */
export interface LegacyParsedStorageKey {
  /**
   * Full filename including extension.
   *
   * @example 'data.csv'
   */
  filename: string;

  /**
   * File extension without the dot.
   *
   * @example 'csv'
   */
  ext: string;

  /**
   * Unix timestamp (seconds since epoch) when the key was generated.
   * Only present for upload keys.
   */
  timestamp: number;
}

/**
 * Complete metadata about a stored object.
 * Includes both parsed key information and S3 object metadata.
 */
export interface StorageMetadata {
  /**
   * Full filename including extension.
   */
  filename: string;

  /**
   * File extension without the dot.
   */
  ext: string;

  /**
   * Object size in bytes.
   */
  size: number;

  /**
   * Content type (MIME type) of the object.
   */
  contentType: string;

  /**
   * Unix timestamp (seconds since epoch) when the metadata was retrieved.
   * For uploads, this is typically the current time. For snapshots, this is also the current time.
   */
  timestamp: number;
}

/**
 * Response from generating a presigned upload URL.
 */
export interface PresignedUpload {
  /**
   * S3 object key where the file should be uploaded.
   */
  key: string;

  /**
   * Presigned URL for uploading the file.
   * Valid for the duration specified in presignPutTtl.
   */
  url: string;

  /**
   * Number of seconds until the URL expires.
   */
  expiresIn: number;
}

/**
 * Response from generating a presigned download URL.
 * Includes metadata about the object being downloaded.
 */
export interface PresignedDownload {
  /**
   * Presigned URL for downloading the file.
   * Valid for the duration specified in presignGetTtl.
   */
  url: string;

  /**
   * Number of seconds until the URL expires.
   */
  expiresIn: number;

  /**
   * Complete metadata about the object.
   */
  metadata: StorageMetadata;
}
