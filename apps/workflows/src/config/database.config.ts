/**
 * Database configuration and connection management.
 *
 * Handles MongoDB connection via Mongoose.
 */

import mongoose from 'mongoose';
import { SnapshotSchema, MODEL_NAMES } from '@reputo/database';
import type { Snapshot, SnapshotModel } from '@reputo/database';
import type { Logger } from 'pino';
import type { MongoDBConfig } from './environment.config.js';

/**
 * Connects to MongoDB using Mongoose.
 *
 * @param config - MongoDB configuration
 * @param logger - Pino logger instance
 * @returns Promise that resolves when connected
 */
export async function connectDatabase(
  config: MongoDBConfig,
  logger: Logger,
): Promise<void> {
  try {
    logger.info(
      { dbName: config.dbName },
      'Connecting to MongoDB...',
    );

    await mongoose.connect(config.uri);

    logger.info(
      { dbName: config.dbName },
      'Connected to MongoDB successfully',
    );

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error({ error: error.message }, 'MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
  } catch (error) {
    const err = error as Error;
    logger.error({ error: err.message }, 'Failed to connect to MongoDB');
    throw error;
  }
}

/**
 * Disconnects from MongoDB.
 *
 * @param logger - Pino logger instance
 */
export async function disconnectDatabase(logger: Logger): Promise<void> {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    const err = error as Error;
    logger.error({ error: err.message }, 'Error closing MongoDB connection');
  }
}

/**
 * Gets the Snapshot model instance.
 *
 * @returns Mongoose model for Snapshot documents
 */
export function getSnapshotModel(): SnapshotModel {
  // Check if model already exists to avoid OverwriteModelError
  if (mongoose.models[MODEL_NAMES.SNAPSHOT]) {
    return mongoose.models[MODEL_NAMES.SNAPSHOT] as SnapshotModel;
  }

  return mongoose.model<Snapshot, SnapshotModel>(
    MODEL_NAMES.SNAPSHOT,
    SnapshotSchema,
  );
}

