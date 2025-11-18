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
    nodeEnv: string
    /** Application log level */
    logLevel: string
}

/**
 * AWS and storage configuration.
 */
export interface StorageConfig {
    /** AWS region for S3 operations */
    awsRegion: string
    /** AWS access key ID (optional, only used in non-production environments) */
    awsAccessKeyId?: string
    /** AWS secret access key (optional, only used in non-production environments) */
    awsSecretAccessKey?: string
    /** S3 bucket name for algorithm inputs and outputs */
    bucket: string
    /** Maximum size for storage objects in bytes */
    maxSizeBytes: number
    /** Allowed content types for storage operations */
    contentTypeAllowlist: string[]
}

/**
 * Temporal server configuration.
 */
export interface TemporalConfig {
    /** Temporal server address (host:port) */
    address: string
    /** Temporal namespace (default: 'default') */
    namespace: string
    /** Task queue name for this worker */
    taskQueue: string
}

/**
 * Complete configuration object.
 */
export interface Config {
    /** Application configuration */
    app: AppConfig
    /** Storage configuration */
    storage: StorageConfig
    /** Temporal configuration */
    temporal: TemporalConfig
}

/**
 * Loads and validates environment variables.
 *
 * @returns Validated configuration object
 * @throws Error if required environment variables are missing
 */
export function loadConfig(): Config {
    // Application configuration
    const nodeEnv = process.env.NODE_ENV || 'development'
    const logLevel = process.env.LOG_LEVEL || 'info'

    // AWS and Storage configuration
    const awsRegion = process.env.AWS_REGION
    const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID
    const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

    if (!awsRegion) {
        throw new Error('AWS_REGION environment variable is required')
    }

    const storageBucket = process.env.STORAGE_BUCKET
    if (!storageBucket) {
        throw new Error('STORAGE_BUCKET environment variable is required')
    }

    const storageMaxSizeBytes = Number(
        process.env.STORAGE_MAX_SIZE_BYTES || 104857600
    )

    const storageContentTypeAllowlist = (
        process.env.STORAGE_CONTENT_TYPE_ALLOWLIST ||
        'text/csv,application/json'
    )
        .split(',')
        .map((s) => s.trim())

    // Temporal configuration
    const temporalAddress = process.env.TEMPORAL_ADDRESS
    const temporalNamespace = process.env.TEMPORAL_NAMESPACE || 'default'
    const temporalTaskQueue =
        process.env.TEMPORAL_TASK_QUEUE || 'reputation-algorithms-typescript'

    if (!temporalAddress) {
        throw new Error('TEMPORAL_ADDRESS environment variable is required')
    }

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
    }
}
