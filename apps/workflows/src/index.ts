/**
 * Worker bootstrap for Temporal workflows.
 *
 * This module initializes and runs a Temporal Worker that:
 * - Registers the RunSnapshotWorkflow
 * - Registers database and algorithm library activities
 * - Connects to MongoDB
 * - Listens on the configured task queue
 */

import { createRequire } from 'node:module';
// Load environment variables from .env file
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenvConfig } from 'dotenv';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create CommonJS require for resolving workflow entrypoint
const require = createRequire(import.meta.url);

// Load .env file from the workflows directory
// Try multiple possible locations
const envPaths = [
  resolve(process.cwd(), '.env'), // Current working directory
  resolve(process.cwd(), 'apps/workflows/.env'), // From monorepo root
  resolve(__dirname, '.env'), // From compiled dist directory
];

// Try to load .env from the first available location
for (const envPath of envPaths) {
  const result = dotenvConfig({ path: envPath });
  if (!result.error) {
    break;
  }
}

import { NativeConnection, Worker } from '@temporalio/worker';
import { createWorkflowActivities } from './activities/index.js';
import { connectDatabase, createLogger, disconnectDatabase, getSnapshotModel, loadConfig } from './config/index.js';

/**
 * Main worker initialization and execution function.
 */
async function run(): Promise<void> {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Stage 1: Load configuration and initialize logger
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const config = loadConfig();
  const logger = createLogger(config.app);

  logger.info(
    {
      taskQueue: config.temporal.taskQueue,
      namespace: config.temporal.namespace,
      address: config.temporal.address,
    },
    'Starting Temporal Worker for Reputo Workflows',
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Stage 2: Connect to MongoDB
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await connectDatabase(config.mongodb, logger);

  // Get Mongoose models
  const snapshotModel = getSnapshotModel();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Stage 3: Create activities with injected dependencies
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const activities = createWorkflowActivities(snapshotModel);

  logger.info(
    {
      activityCount: Object.keys(activities).length,
      activities: Object.keys(activities),
    },
    'Activities initialized',
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Stage 4: Connect to Temporal server
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const connection = await NativeConnection.connect({
    address: config.temporal.address,
  });

  logger.info({ address: config.temporal.address }, 'Connected to Temporal server');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Stage 5: Create and run Temporal Worker
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Resolve workflows path using Node resolution.
  // In dev (tsx), this maps to the TypeScript source.
  // In prod (node dist/index.js), this resolves to dist/workflows/index.js.
  const workflowsPath = require.resolve('./workflows/index.js');

  const worker = await Worker.create({
    connection,
    namespace: config.temporal.namespace,
    taskQueue: config.temporal.taskQueue,
    workflowsPath,
    activities,
    // Enable verbose logging for development
    enableSDKTracing: config.app.nodeEnv === 'development',
  });

  logger.info(
    {
      taskQueue: config.temporal.taskQueue,
      namespace: config.temporal.namespace,
    },
    'Worker created successfully',
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Stage 6: Set up graceful shutdown
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const shutdown = async () => {
    logger.info('Shutting down worker...');

    try {
      // Stop accepting new work
      worker.shutdown();
      logger.info('Worker shutdown initiated');

      // Close database connection
      await disconnectDatabase(logger);

      // Close Temporal connection
      await connection.close();
      logger.info('Temporal connection closed');

      logger.info('Worker shut down successfully');
      process.exit(0);
    } catch (error) {
      const err = error as Error;
      logger.error({ error: err.message }, 'Error during shutdown');
      process.exit(1);
    }
  };

  // Handle shutdown signals
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Stage 7: Run the worker (blocks until shutdown)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  logger.info({ taskQueue: config.temporal.taskQueue }, 'Worker is running and polling for tasks');

  await worker.run();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Bootstrap
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

run().catch((error) => {
  console.error('Fatal error starting worker:', error);
  process.exit(1);
});
