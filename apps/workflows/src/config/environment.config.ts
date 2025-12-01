/**
 * Environment configuration for the workflows application.
 *
 * Validates and provides typed access to environment variables.
 */

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
 * MongoDB database configuration.
 */
export interface MongoDBConfig {
  /** MongoDB connection URI */
  uri: string;
  /** Database name */
  dbName: string;
}

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
 * Complete configuration object.
 */
export interface Config {
  /** Application configuration */
  app: AppConfig;
  /** Temporal configuration */
  temporal: TemporalConfig;
  /** MongoDB configuration */
  mongodb: MongoDBConfig;
}

/**
 * Loads and validates environment variables.
 *
 * @returns Validated configuration object
 * @throws Error if required environment variables are missing
 */
export function loadConfig(): Config {
  // Temporal configuration
  const temporalAddress = process.env.TEMPORAL_ADDRESS;
  const temporalNamespace = process.env.TEMPORAL_NAMESPACE || 'default';
  const temporalTaskQueue = process.env.TEMPORAL_TASK_QUEUE || 'workflows';

  if (!temporalAddress) {
    throw new Error('TEMPORAL_ADDRESS environment variable is required');
  }

  // MongoDB configuration
  const mongodbHost = process.env.MONGODB_HOST;
  const mongodbPort = process.env.MONGODB_PORT;
  const mongodbUser = process.env.MONGODB_USER;
  const mongodbPassword = process.env.MONGODB_PASSWORD;
  const mongodbDbName = process.env.MONGODB_DB_NAME;

  if (!mongodbHost || !mongodbPort || !mongodbUser || !mongodbPassword || !mongodbDbName) {
    throw new Error(
      'MongoDB environment variables are required: MONGODB_HOST, MONGODB_PORT, MONGODB_USER, MONGODB_PASSWORD, MONGODB_DB_NAME',
    );
  }

  const mongodbUri = `mongodb://${mongodbUser}:${mongodbPassword}@${mongodbHost}:${mongodbPort}/${mongodbDbName}?authSource=admin`;

  // Application configuration
  const nodeEnv = process.env.NODE_ENV || 'development';
  const logLevel = process.env.LOG_LEVEL || 'info';

  return {
    app: {
      nodeEnv,
      logLevel,
    },
    temporal: {
      address: temporalAddress,
      namespace: temporalNamespace,
      taskQueue: temporalTaskQueue,
    },
    mongodb: {
      uri: mongodbUri,
      dbName: mongodbDbName,
    },
  };
}
