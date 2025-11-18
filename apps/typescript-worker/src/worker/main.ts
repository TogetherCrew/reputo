/**
 * Worker bootstrap for TypeScript algorithm execution.
 *
 * This module initializes and runs a Temporal Worker that:
 * - Registers algorithm activities (one per algorithm key)
 * - Connects to Temporal server
 * - Listens for tasks on the configured task queue
 */

// Load environment variables from .env file
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const dotenv = require('dotenv')

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file from the typescript-worker directory
// Try multiple possible locations
const envPaths = [
    resolve(process.cwd(), '.env'), // Current working directory
    resolve(process.cwd(), 'apps/typescript-worker/.env'), // From monorepo root
    resolve(__dirname, '.env'), // From compiled dist directory
]

// Try to load .env from the first available location
for (const envPath of envPaths) {
    const result = dotenv.config({ path: envPath })
    if (!result.error) {
        break
    }
}

import { NativeConnection, Worker } from '@temporalio/worker'
import { loadConfig, createLogger } from '../config/index.js'
import { createS3Client, createStorage } from '../storage.js'
import * as activities from '../activities/index.js'

/**
 * Main worker initialization and execution function.
 */
async function run(): Promise<void> {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Stage 1: Load configuration and initialize logger
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const config = loadConfig()
    const logger = createLogger(config.app)

    logger.info(
        {
            taskQueue: config.temporal.taskQueue,
            namespace: config.temporal.namespace,
            address: config.temporal.address,
            storageBucket: config.storage.bucket,
        },
        'Starting TypeScript Algorithm Worker for Reputo'
    )

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Stage 2: Initialize storage
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const s3Client = createS3Client(config)
    const storage = createStorage(config, s3Client)

    // Store storage instance globally so activities can access it
    // biome-ignore lint/suspicious/noExplicitAny: storage needs to be accessible to activities
    ;(global as any).storage = storage

    logger.info(
        {
            bucket: config.storage.bucket,
            region: config.storage.awsRegion,
        },
        'Storage initialized'
    )

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Stage 3: Connect to Temporal server
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const connection = await NativeConnection.connect({
        address: config.temporal.address,
    })

    logger.info(
        { address: config.temporal.address },
        'Connected to Temporal server'
    )

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Stage 4: Create and run Temporal Worker
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const worker = await Worker.create({
        connection,
        namespace: config.temporal.namespace,
        taskQueue: config.temporal.taskQueue,
        // Register child workflows for executing algorithm activities
        // Resolve to compiled JS in dist/workflows/index.js at runtime
        workflowsPath: require.resolve('../workflows/index.js'),
        activities,
        // Enable verbose logging for development
        enableSDKTracing: config.app.nodeEnv === 'development',
    })

    logger.info(
        {
            activityCount: Object.keys(activities).length,
            activities: Object.keys(activities),
            taskQueue: config.temporal.taskQueue,
            namespace: config.temporal.namespace,
        },
        'Worker created successfully'
    )

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Stage 5: Set up graceful shutdown
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const shutdown = async () => {
        logger.info('Shutting down worker...')

        try {
            // Stop accepting new work
            worker.shutdown()
            logger.info('Worker shutdown initiated')

            // Close Temporal connection
            await connection.close()
            logger.info('Temporal connection closed')

            logger.info('Worker shut down successfully')
            process.exit(0)
        } catch (error) {
            const err = error as Error
            logger.error({ error: err.message }, 'Error during shutdown')
            process.exit(1)
        }
    }

    // Handle shutdown signals
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Stage 6: Run the worker (blocks until shutdown)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    logger.info(
        { taskQueue: config.temporal.taskQueue },
        'Worker is running and polling for tasks'
    )

    await worker.run()
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Bootstrap
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

run().catch((error) => {
    console.error('Fatal error starting worker:', error)
    process.exit(1)
})
