import { createRequire } from 'node:module';
import { connect, disconnect } from '@reputo/database';
import { NativeConnection, Worker } from '@temporalio/worker';
import { createAlgorithmLibraryActivities, createDbActivities } from '../../activities/orchestrator/index.js';
import config from '../../config/index.js';
import { logger } from '../../shared/utils/index.js';

const require = createRequire(import.meta.url);

async function run(): Promise<void> {
  logger.info('Starting Orchestrator Worker');

  await connect(config.mongoDB.uri);

  const connection = await NativeConnection.connect({
    address: config.temporal.address,
  });

  logger.info('Connected to Temporal server');

  const worker = await Worker.create({
    connection,
    namespace: config.temporal.namespace,
    taskQueue: config.temporal.orchestratorTaskQueue,

    workflowsPath: require.resolve('../../workflows/orchestrator.workflow'),
    activities: {
      ...createDbActivities(),
      ...createAlgorithmLibraryActivities(),
    },
    bundlerOptions: {
      ignoreModules: ['fs', 'path', 'os', 'crypto'],
    },
  });

  logger.info('Worker created successfully');

  const shutdown = async () => {
    logger.info('Shutting down orchestrator worker...');

    try {
      worker.shutdown();
      logger.info('Worker shutdown initiated');

      await disconnect();
      logger.info('MongoDB connection closed');

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

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  logger.info({ taskQueue: config.temporal.orchestratorTaskQueue }, 'Worker is running and polling for tasks');

  await worker.run();
}

run().catch((error) => {
  console.error('Fatal error starting orchestrator worker:', error);
  process.exit(1);
});
