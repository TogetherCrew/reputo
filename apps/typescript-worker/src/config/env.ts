/**
 * Environment configuration for the TypeScript worker application.
 *
 * Validates and provides typed access to environment variables.
 */

/**
 * Application configuration.
 */
export interface AppConfig {
  /** Node environment (development, production, etc.) */
  nodeEnv: string;
  /** Application log level */
  logLevel: string;
}

/**
 * AWS and storage configuration.
 */
export interface StorageConfig {
  /** AWS region for S3 operations */
  awsRegion: string;
  /** AWS access key ID (optional, only used in non-production environments) */
  awsAccessKeyId?: string;
  /** AWS secret access key (optional, only used in non-production environments) */
  awsSecretAccessKey?: string;
  /** S3 bucket name for algorithm inputs and outputs */
  bucket: string;
  /** Maximum size for storage objects in bytes */
  maxSizeBytes: number;
  /** Allowed content types for storage operations */
  contentTypeAllowlist: string[];
}

/**
 * Temporal server configuration.
 */
export interface TemporalConfig {
  /** Temporal server address (host:port) */
  address: string;
  /** Temporal namespace (default: 'default') */
  namespace: string;
  /** Task queue name for this worker */
  taskQueue: string;
}

/**
 * DeepFunding Portal API configuration.
 */
export interface DeepFundingConfig {
  /** Base URL of the DeepFunding Portal API */
  baseUrl: string;
  /** API key for authentication */
  apiKey: string;
  /** Request timeout in milliseconds */
  requestTimeoutMs: number;
  /** Maximum concurrent requests */
  concurrency: number;
  /** Default page limit for paginated requests */
  defaultPageLimit: number;
  /** Retry configuration */
  retry: {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
  };
}

/**
 * Complete configuration object.
 */
export interface Config {
  /** Application configuration */
  app: AppConfig;
  /** Storage configuration */
  storage: StorageConfig;
  /** Temporal configuration */
  temporal: TemporalConfig;
  /** DeepFunding Portal API configuration */
  deepFunding: DeepFundingConfig;
}

/**
 * Loads and validates environment variables.
 *
 * @returns Validated configuration object
 * @throws Error if required environment variables are missing
 */
export function loadConfig(): Config {
  // Application configuration
  const nodeEnv = process.env.NODE_ENV || 'development';
  const logLevel = process.env.LOG_LEVEL || 'info';

  // AWS and Storage configuration
  const awsRegion = process.env.AWS_REGION;
  const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!awsRegion) {
    throw new Error('AWS_REGION environment variable is required');
  }

  const storageBucket = process.env.STORAGE_BUCKET;
  if (!storageBucket) {
    throw new Error('STORAGE_BUCKET environment variable is required');
  }

  const storageMaxSizeBytes = Number(process.env.STORAGE_MAX_SIZE_BYTES || 104857600);

  const storageContentTypeAllowlist = (process.env.STORAGE_CONTENT_TYPE_ALLOWLIST || 'text/csv,application/json')
    .split(',')
    .map((s) => s.trim());

  // Temporal configuration
  const temporalAddress = process.env.TEMPORAL_ADDRESS;
  const temporalNamespace = process.env.TEMPORAL_NAMESPACE || 'default';
  const temporalTaskQueue = process.env.TEMPORAL_TASK_QUEUE || 'reputation-algorithms-typescript';

  if (!temporalAddress) {
    throw new Error('TEMPORAL_ADDRESS environment variable is required');
  }

  // DeepFunding Portal API configuration
  const deepFundingBaseUrl = process.env.DEEPFUNDING_API_BASE_URL || 'https://deepfunding.ai/wp-json/deepfunding/v1';
  const deepFundingApiKey = process.env.DEEPFUNDING_API_KEY;
  if (!deepFundingApiKey) {
    throw new Error('DEEPFUNDING_API_KEY environment variable is required');
  }

  const deepFundingRequestTimeoutMs = Number(process.env.DEEPFUNDING_API_REQUEST_TIMEOUT_MS || 45_000);
  const deepFundingConcurrency = Number(process.env.DEEPFUNDING_API_CONCURRENCY || 4);
  const deepFundingDefaultPageLimit = Number(process.env.DEEPFUNDING_API_DEFAULT_PAGE_LIMIT || 500);

  const deepFundingRetryMaxAttempts = Number(process.env.DEEPFUNDING_API_RETRY_MAX_ATTEMPTS || 7);
  const deepFundingRetryBaseDelayMs = Number(process.env.DEEPFUNDING_API_RETRY_BASE_DELAY_MS || 500);
  const deepFundingRetryMaxDelayMs = Number(process.env.DEEPFUNDING_API_RETRY_MAX_DELAY_MS || 20_000);

  return {
    app: {
      nodeEnv,
      logLevel,
    },
    storage: {
      awsRegion,
      awsAccessKeyId,
      awsSecretAccessKey,
      bucket: storageBucket,
      maxSizeBytes: storageMaxSizeBytes,
      contentTypeAllowlist: storageContentTypeAllowlist,
    },
    temporal: {
      address: temporalAddress,
      namespace: temporalNamespace,
      taskQueue: temporalTaskQueue,
    },
    deepFunding: {
      baseUrl: deepFundingBaseUrl,
      apiKey: deepFundingApiKey,
      requestTimeoutMs: deepFundingRequestTimeoutMs,
      concurrency: deepFundingConcurrency,
      defaultPageLimit: deepFundingDefaultPageLimit,
      retry: {
        maxAttempts: deepFundingRetryMaxAttempts,
        baseDelayMs: deepFundingRetryBaseDelayMs,
        maxDelayMs: deepFundingRetryMaxDelayMs,
      },
    },
  };
}
