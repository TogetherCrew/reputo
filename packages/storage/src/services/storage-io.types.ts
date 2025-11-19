/**
 * @reputo/storage/services/storage-io.types
 *
 * Type definitions for storage I/O operations.
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
   * Valid for the duration specified in config.
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
   * Valid for the duration specified in config.
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
