/**
 * Hardcoded configuration for the DeepFunding Portal data sync example
 *
 * In production, these values should come from environment variables.
 */

/**
 * DeepFunding Portal API configuration
 */
export const API_CONFIG = {
  /** Base URL of the DeepFunding Portal API */
  baseUrl: 'https://deepfunding.ai/wp-json/deepfunding/v1',
  /** API key for authentication - replace with your actual key */
  apiKey: '',
  /** Request timeout in milliseconds */
  requestTimeoutMs: 45_000,
  /** Maximum concurrent requests */
  concurrency: 4,
  /** Retry configuration */
  retry: {
    maxAttempts: 7,
    baseDelayMs: 500,
    maxDelayMs: 20_000,
  },
  /** Default page limit for paginated requests */
  defaultPageLimit: 500,
} as const;

/**
 * S3 storage configuration
 */
export const S3_CONFIG = {
  /** S3 bucket name */
  bucket: '',
  /** AWS region */
  region: 'eu-central-1',
  /** AWS credentials - replace with your actual credentials */
  credentials: {
    accessKeyId: '',
    secretAccessKey: '',
  },
  /** Presigned URL TTL for uploads (seconds) */
  presignPutTtl: 3600,
  /** Presigned URL TTL for downloads (seconds) */
  presignGetTtl: 900,
  /** Maximum file size in bytes (100 MB) */
  maxSizeBytes: 104_857_600,
  /** Allowed content types for uploads */
  contentTypeAllowlist: ['application/json', 'text/csv'],
} as const;

/**
 * SQLite database configuration
 */
export const SQLITE_CONFIG = {
  /** Path to the SQLite database file */
  path: './deepfunding-portal.db',
} as const;

/**
 * Logging configuration
 */
export const LOG_CONFIG = {
  /** Enable verbose logging */
  verbose: true,
} as const;
