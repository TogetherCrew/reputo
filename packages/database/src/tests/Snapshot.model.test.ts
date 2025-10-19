import { Types } from 'mongoose';
import { beforeEach, describe, expect, test } from 'vitest';
import { Snapshot } from '../interfaces/index.js';
import SnapshotModel from '../models/Snapshot.model.js';

describe('Snapshot model', () => {
  describe('Snapshot validation', () => {
    let snapshot: Snapshot;
    let algorithmPresetId: Types.ObjectId;

    beforeEach(() => {
      algorithmPresetId = new Types.ObjectId();
      snapshot = {
        status: 'queued',
        algorithmPreset: algorithmPresetId,
        temporal: {
          workflowId: 'workflow-123',
          runId: 'run-456',
          taskQueue: 'snapshot-queue',
        },
        outputs: {
          result: 'success',
          data: [1, 2, 3],
        },
      };
    });

    test('should correctly validate a valid snapshot', async () => {
      const doc = new SnapshotModel(snapshot);
      await expect(doc.validate()).resolves.toBeUndefined();
    });
  });
});
