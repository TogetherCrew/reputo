import { type Snapshot, SnapshotModelValue as SnapshotModel } from '@reputo/database';
import { Context } from '@temporalio/activity';

import { SnapshotNotFoundError } from '../../shared/errors/index.js';
import type {
  DbActivities,
  GetSnapshotInput,
  GetSnapshotOutput,
  UpdateSnapshotInput,
} from '../../shared/types/index.js';

export function createDbActivities(): DbActivities {
  return {
    async getSnapshot(input: GetSnapshotInput): Promise<GetSnapshotOutput> {
      const logger = Context.current().log;
      logger.info('Fetching snapshot', { snapshotId: input.snapshotId });

      const snapshot = await SnapshotModel.findById(input.snapshotId).lean().exec();

      if (!snapshot) {
        logger.error('Snapshot not found', {
          snapshotId: input.snapshotId,
        });
        throw new SnapshotNotFoundError(input.snapshotId);
      }

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

    async updateSnapshot(input: UpdateSnapshotInput): Promise<void> {
      const logger = Context.current().log;
      logger.info('Updating snapshot', {
        snapshotId: input.snapshotId,
        status: input.status,
      });

      const updateData: Partial<Snapshot> = {};

      if (input.status) {
        updateData.status = input.status;

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

      if (input.error) {
        updateData.error = input.error;
      }

      const result = await SnapshotModel.findByIdAndUpdate(input.snapshotId, { $set: updateData }, { new: true })
        .lean()
        .exec();

      if (!result) {
        logger.error('Snapshot update failed', {
          snapshotId: input.snapshotId,
        });
        throw new SnapshotNotFoundError(input.snapshotId);
      }

      logger.info('Snapshot updated successfully', {
        snapshotId: input.snapshotId,
        status: result.status,
      });
    },
  };
}
