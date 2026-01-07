import { createS3Client, Storage } from '@reputo/storage';
import { NativeConnection, Worker } from '@temporalio/worker';

import { createDependencyResolverActivities } from '../../activities/orchestrator/index.js';
import { dispatchAlgorithm } from '../../activities/typescript/dispatchAlgorithm.activity.js';
import config from '../../config/index.js';
import { logger } from '../../shared/utils/index.js';

async function run(): Promise<void> {
  logger.info('Starting TypeScript Algorithm Worker');

  const connection = await NativeConnection.connect({
    address: config.temporal.address,
  });

  logger.info('Connected to Temporal server');

  const s3Client = createS3Client(
    {
      region: config.aws.region,
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
    config.app.nodeEnv,
  );

  const storage = new Storage(s3Client);

  logger.info('Storage initialized');

  const storageConfig = {
    bucket: config.storage.bucket,
    maxSizeBytes: config.storage.maxSizeBytes,
  };

  const dependencyResolverActivities = createDependencyResolverActivities({
    storage,
    storageConfig,
  });

  const activities = {
    runTypescriptAlgorithm: dispatchAlgorithm(storage),
    ...dependencyResolverActivities,
  };

  logger.info(`Activities initialized: [${Object.keys(activities).join(', ')}]`);

  const worker = await Worker.create({
    connection,
    namespace: config.temporal.namespace,
    taskQueue: config.temporal.algorithmTypescriptTaskQueue,
    activities,
  });

  logger.info('Worker created successfully');

  const shutdown = async () => {
    logger.info('Shutting down algorithm worker...');

    try {
      worker.shutdown();
      logger.info('Worker shutdown initiated');

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

  logger.info('Worker is running and polling for tasks');

  await worker.run();
}

run().catch((error) => {
  console.error('Fatal error starting algorithm worker:', error);
  process.exit(1);
});
