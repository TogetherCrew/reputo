import { Schema } from 'mongoose';
import { SNAPSHOT_STATUS } from '../constants/index.js';
import { Snapshot, SnapshotModel } from '../interfaces/index.js';

/**
 * Mongoose schema for Snapshot documents.
 */
const SnapshotSchema = new Schema<Snapshot, SnapshotModel>(
  {
    status: {
      type: String,
      enum: SNAPSHOT_STATUS,
      default: 'queued',
    },
    temporal: new Schema<Snapshot['temporal']>(
      {
        workflowId: { type: String },
        runId: { type: String },
        taskQueue: { type: String },
      },
      { _id: false, versionKey: false, strict: true },
    ),
    algorithmPreset: {
      type: Schema.Types.ObjectId,
      ref: 'AlgorithmPreset',
      index: true,
      immutable: true,
      required: true,
    },
    outputs: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: false,
  },
);
SnapshotSchema.index({ algorithmPreset: 1 });
export default SnapshotSchema as Schema<Snapshot, SnapshotModel>;
