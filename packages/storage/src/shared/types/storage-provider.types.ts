/**
 * @reputo/storage/shared/types/storage-provider
 *
 * Generic storage provider type definitions.
 * These types are provider-agnostic and can be implemented by any storage service.
 */

/**
 * Generic metadata returned by storage providers.
 *
 * Providers map their specific metadata formats to this common structure.
 */
export interface ProviderMetadata {
  /**
   * Object size in bytes.
   */
  size: number;

  /**
   * Content type (MIME type) of the object.
   */
  contentType: string;

  /**
   * Last modified timestamp.
   */
  lastModified: Date | undefined;

  /**
   * Entity tag for the object (for caching/versioning).
   */
  etag: string | undefined;
}

/**
 * Options for error handling in providers.
 */
export interface ProviderErrorOptions {
  /**
   * Original error from the underlying storage service.
   */
  cause?: Error;
}
