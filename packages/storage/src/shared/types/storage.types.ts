/**
 * @reputo/storage/shared/types/storage
 *
 * Type definitions for storage operations.
 */

/**
 * Result from generating a presigned upload URL.
 */
export interface UploadUrlResult {
  /**
   * Storage key where the file will be uploaded.
   */
  key: string;

  /**
   * Presigned URL for uploading the file.
   * Valid for the duration specified in options.
   */
  url: string;

  /**
   * Number of seconds until the URL expires.
   */
  expiresIn: number;
}

/**
 * Complete metadata about a stored object.
 */
export interface ObjectMetadata {
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
 * Result from generating a presigned download URL.
 */
export interface DownloadUrlResult {
  /**
   * Presigned URL for downloading the file.
   * Valid for the duration specified in options.
   */
  url: string;

  /**
   * Number of seconds until the URL expires.
   */
  expiresIn: number;

  /**
   * Complete metadata about the object.
   */
  metadata: ObjectMetadata;
}

/**
 * Result from verifying an uploaded file.
 */
export interface VerificationResult {
  /**
   * Storage key of the verified object.
   */
  key: string;

  /**
   * Complete metadata about the verified object.
   */
  metadata: ObjectMetadata;
}

/**
 * Parsed components of a storage key.
 * Extracted from the key path structure.
 *
 * Storage keys follow the convention: `uploads/{timestamp}/{filename}.{ext}`
 */
export interface ParsedStorageKey {
  /**
   * Full filename including extension.
   */
  filename: string;

  /**
   * File extension without the dot.
   */
  ext: string;

  /**
   * Unix timestamp (seconds since epoch) when the key was generated.
   */
  timestamp: number;
}

