/**
 * Database activities for Temporal workflows.
 *
 * Provides activities for interacting with MongoDB via Mongoose models.
 * These activities handle snapshot retrieval and updates within workflow executions.
 */

import type { Snapshot } from '@reputo/database';
import { Context } from '@temporalio/activity';
import type { Model } from 'mongoose';

/**
 * Input for getSnapshot activity.
 */
export interface GetSnapshotInput {
  /** MongoDB ObjectId of the snapshot to retrieve */
  snapshotId: string;
}

/**
 * Output for getSnapshot activity.
 */
export interface GetSnapshotOutput {
  /** Retrieved snapshot document */
  snapshot: Snapshot;
}

/**
 * Input for updateSnapshot activity.
 */
export interface UpdateSnapshotInput {
  /** MongoDB ObjectId of the snapshot to update */
  snapshotId: string;
  /** New status for the snapshot */
  status?: Snapshot['status'];
  /** Temporal workflow metadata to store */
  temporal?: Snapshot['temporal'];
  /** Output data locations after successful execution */
  outputs?: Snapshot['outputs'];
  /** Error metadata (for failed executions) */
  error?: {
    message: string;
    [key: string]: unknown;
  };
}

/**
 * Database activities registry.
 *
 * Exported as a factory to allow dependency injection of Mongoose models.
 */
export interface DatabaseActivities {
  getSnapshot: (input: GetSnapshotInput) => Promise<GetSnapshotOutput>;
  updateSnapshot: (input: UpdateSnapshotInput) => Promise<void>;
}

/**
 * Creates database activities with injected dependencies.
 *
 * @param snapshotModel - Mongoose model for Snapshot documents
 * @returns Database activities object
 */
export function createDatabaseActivities(snapshotModel: Model<Snapshot>): DatabaseActivities {
  return {
    /**
     * Retrieves a snapshot document by ID.
     *
     * @param input - Contains the snapshot ID to retrieve
     * @returns The snapshot document
     * @throws Error if snapshot is not found or is in an invalid state
     *
     * @example
     * ```ts
     * const { snapshot } = await getSnapshot({ snapshotId: '507f1f77bcf86cd799439011' })
     * ```
     */
    async getSnapshot(input: GetSnapshotInput): Promise<GetSnapshotOutput> {
      const logger = Context.current().log;
      logger.info('Fetching snapshot', { snapshotId: input.snapshotId });

      const snapshot = await snapshotModel.findById(input.snapshotId).lean().exec();

      if (!snapshot) {
        const error = new Error(`Snapshot not found: ${input.snapshotId}`);
        logger.error('Snapshot not found', {
          snapshotId: input.snapshotId,
          error: error.message,
        });
        throw error;
      }

      // Optional: verify snapshot is in a processable state
      if (snapshot.status === 'completed') {
        logger.warn('Snapshot already completed', {
          snapshotId: input.snapshotId,
          status: snapshot.status,
        });
      }

      logger.info('Snapshot fetched successfully', {
        snapshotId: input.snapshotId,
        status: snapshot.status,
        algorithmKey: snapshot.algorithmPresetFrozen?.key,
      });

      return { snapshot };
    },

    /**
     * Updates a snapshot document with partial data.
     *
     * Used at multiple stages of workflow execution:
     * - Early: mark as 'processing' and record workflow metadata
     * - Success: mark as 'completed' and store outputs
     * - Failure: mark as 'failed' and optionally store error info
     *
     * @param input - Partial snapshot updates to apply
     * @throws Error if snapshot is not found or update fails
     *
     * @example
     * ```ts
     * await updateSnapshot({
     *   snapshotId: '507f1f77bcf86cd799439011',
     *   status: 'processing',
     *   temporal: { workflowId, runId, taskQueue }
     * })
     * ```
     */
    async updateSnapshot(input: UpdateSnapshotInput): Promise<void> {
      const logger = Context.current().log;
      logger.info('Updating snapshot', {
        snapshotId: input.snapshotId,
        status: input.status,
      });

      // Build update object with only provided fields
      const updateData: Partial<Snapshot> = {};

      if (input.status) {
        updateData.status = input.status;

        // Set timestamp fields based on status transitions
        if (input.status === 'running') {
          updateData.startedAt = new Date();
        } else if (input.status === 'completed' || input.status === 'failed') {
          updateData.completedAt = new Date();
        }
      }

      if (input.temporal) {
        updateData.temporal = input.temporal;
      }

      if (input.outputs) {
        updateData.outputs = input.outputs;
      }

      // Note: error field is not part of Snapshot schema currently,
      // but can be added if needed for error tracking

      const result = await snapshotModel
        .findByIdAndUpdate(input.snapshotId, { $set: updateData }, { new: true })
        .lean()
        .exec();

      if (!result) {
        const error = new Error(`Failed to update snapshot: ${input.snapshotId}`);
        logger.error('Snapshot update failed', {
          snapshotId: input.snapshotId,
          error: error.message,
        });
        throw error;
      }

      logger.info('Snapshot updated successfully', {
        snapshotId: input.snapshotId,
        status: result.status,
      });
    },
  };
}
