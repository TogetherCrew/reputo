/**
 * @reputo/storage/shared/types
 *
 * Type definitions for the storage package.
 */

/**
 * Types of storage keys supported by the system.
 *
 * - 'upload': User-uploaded files (`uploads/{timestamp}/{filename}.{ext}`)
 * - 'snapshot-input': Snapshot input files (`snapshots/{snapshotId}/inputs/{inputName}.{ext}`)
 * - 'snapshot-output': Snapshot output files (`snapshots/{snapshotId}/outputs/{algorithmKey}.{ext}`)
 */
export type StorageKeyType = 'upload' | 'snapshot-input' | 'snapshot-output';

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
 * Pattern: `uploads/{timestamp}/{filename}.{ext}`
 */
export interface ParsedUploadKey extends ParsedStorageKeyBase {
  type: 'upload';

  /**
   * Unix timestamp (seconds since epoch) when the key was generated.
   */
  timestamp: number;
}

/**
 * Parsed snapshot input key components.
 * Pattern: `snapshots/{snapshotId}/inputs/{inputName}.{ext}`
 */
export interface ParsedSnapshotInputKey extends ParsedStorageKeyBase {
  type: 'snapshot-input';

  /**
   * Unique identifier of the snapshot.
   */
  snapshotId: string;

  /**
   * Logical input name (e.g., 'votes', 'users').
   */
  inputName: string;
}

/**
 * Parsed snapshot output key components.
 * Pattern: `snapshots/{snapshotId}/outputs/{algorithmKey}.{ext}`
 */
export interface ParsedSnapshotOutputKey extends ParsedStorageKeyBase {
  type: 'snapshot-output';

  /**
   * Unique identifier of the snapshot.
   */
  snapshotId: string;

  /**
   * Algorithm key that produced this output (e.g., 'voting_engagement').
   */
  algorithmKey: string;
}

/**
 * Parsed components of a storage key.
 * Discriminated union based on the `type` field.
 */
export type ParsedStorageKey = ParsedUploadKey | ParsedSnapshotInputKey | ParsedSnapshotOutputKey;

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
   * Unix timestamp (seconds since epoch) when the key was generated.
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
