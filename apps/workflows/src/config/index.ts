import Joi from 'joi';

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    LOG_LEVEL: Joi.string().required().description('Min allowed log level'),
    TEMPORAL_ADDRESS: Joi.string().required().description('Temporal server address'),
    TEMPORAL_NAMESPACE: Joi.string().required().description('Temporal namespace'),
    TEMPORAL_ORCHESTRATOR_TASK_QUEUE: Joi.string()
      .required()
      .description('Temporal task queue for orchestrator workflows'),
    TEMPORAL_ALGORITHM_TYPESCRIPT_TASK_QUEUE: Joi.string()
      .required()
      .description('Temporal task queue for TypeScript algorithm workers'),
    TEMPORAL_ALGORITHM_PYTHON_TASK_QUEUE: Joi.string()
      .required()
      .description('Temporal task queue for Python algorithm workers'),
    MONGODB_HOST: Joi.string().required().description('MongoDB host'),
    MONGODB_PORT: Joi.string().required().description('MongoDB port'),
    MONGODB_USER: Joi.string().allow('').description('MongoDB username'),
    MONGODB_PASSWORD: Joi.string().allow('').description('MongoDB password'),
    MONGODB_DB_NAME: Joi.string().required().description('MongoDB database name'),
    AWS_REGION: Joi.string().description('AWS region for S3 operations'),
    AWS_ACCESS_KEY_ID: Joi.string().allow('').description('AWS access key ID (optional, only used in non-production)'),
    AWS_SECRET_ACCESS_KEY: Joi.string()
      .allow('')
      .description('AWS secret access key (optional, only used in non-production)'),
    STORAGE_BUCKET: Joi.string().description('S3 bucket name for algorithm inputs and outputs'),
    STORAGE_MAX_SIZE_BYTES: Joi.number().description('Maximum size for storage objects in bytes'),
    STORAGE_CONTENT_TYPE_ALLOWLIST: Joi.string().description('Comma-separated list of allowed content types'),
    DEEPFUNDING_API_BASE_URL: Joi.string().description('DeepFunding API base URL').required(),
    DEEPFUNDING_API_KEY: Joi.string().allow('').description('DeepFunding API key').required(),
    DEEPFUNDING_API_REQUEST_TIMEOUT_MS: Joi.number().description('DeepFunding API request timeout in milliseconds'),
    DEEPFUNDING_API_CONCURRENCY: Joi.number().description('DeepFunding API concurrency limit'),
    DEEPFUNDING_API_DEFAULT_PAGE_LIMIT: Joi.number().description('DeepFunding API default page limit'),
    DEEPFUNDING_API_RETRY_MAX_ATTEMPTS: Joi.number().description('DeepFunding API max retry attempts'),
    DEEPFUNDING_API_RETRY_BASE_DELAY_MS: Joi.number().description('DeepFunding API retry base delay in milliseconds'),
    DEEPFUNDING_API_RETRY_MAX_DELAY_MS: Joi.number().description('DeepFunding API retry max delay in milliseconds'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  app: {
    nodeEnv: envVars.NODE_ENV,
  },
  temporal: {
    address: envVars.TEMPORAL_ADDRESS,
    namespace: envVars.TEMPORAL_NAMESPACE,
    orchestratorTaskQueue: envVars.TEMPORAL_ORCHESTRATOR_TASK_QUEUE,
    algorithmTypescriptTaskQueue: envVars.TEMPORAL_ALGORITHM_TYPESCRIPT_TASK_QUEUE,
    algorithmPythonTaskQueue: envVars.TEMPORAL_ALGORITHM_PYTHON_TASK_QUEUE,
  },
  mongoDB: {
    host: envVars.MONGODB_HOST,
    port: envVars.MONGODB_PORT,
    user: envVars.MONGODB_USER,
    password: envVars.MONGODB_PASSWORD,
    dbName: envVars.MONGODB_DB_NAME,
    uri: `mongodb://${envVars.MONGODB_USER}:${envVars.MONGODB_PASSWORD}@${envVars.MONGODB_HOST}:${envVars.MONGODB_PORT}/${envVars.MONGODB_DB_NAME}?authSource=admin&replicaSet=rs0&directConnection=true`,
  },
  aws: {
    region: envVars.AWS_REGION,
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
  },
  storage: {
    bucket: envVars.STORAGE_BUCKET,
    presignPutTtl: Number(envVars.STORAGE_PRESIGN_PUT_TTL ?? 120),
    presignGetTtl: Number(envVars.STORAGE_PRESIGN_GET_TTL ?? 300),
    maxSizeBytes: Number(envVars.STORAGE_MAX_SIZE_BYTES ?? 52428800),
    contentTypeAllowlist: envVars.STORAGE_CONTENT_TYPE_ALLOWLIST,
  },
  logger: {
    level: envVars.LOG_LEVEL,
  },
  deepfundingPortalApi: {
    apiBaseUrl: envVars.DEEPFUNDING_API_BASE_URL,
    apiKey: envVars.DEEPFUNDING_API_KEY,
    requestTimeoutMs: Number(envVars.DEEPFUNDING_API_REQUEST_TIMEOUT_MS ?? 10000),
    concurrency: Number(envVars.DEEPFUNDING_API_CONCURRENCY ?? 10),
    defaultPageLimit: Number(envVars.DEEPFUNDING_API_DEFAULT_PAGE_LIMIT ?? 100),
    retryMaxAttempts: Number(envVars.DEEPFUNDING_API_RETRY_MAX_ATTEMPTS ?? 3),
    retryBaseDelayMs: Number(envVars.DEEPFUNDING_API_RETRY_BASE_DELAY_MS ?? 1000),
    retryMaxDelayMs: Number(envVars.DEEPFUNDING_API_RETRY_MAX_DELAY_MS ?? 10000),
  },
};
