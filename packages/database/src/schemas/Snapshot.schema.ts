import { Schema } from 'mongoose';
import { MODEL_NAMES, SNAPSHOT_STATUS } from '../constants/index.js';
import { Snapshot, SnapshotModel } from '../interfaces/index.js';
import { paginate } from '../plugins/index.js';
import { AlgorithmPresetFrozenSchema } from './AlgorithmPresetFrozen.schema.js';

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
      ref: MODEL_NAMES.ALGORITHM_PRESET,
      required: true,
    },
    algorithmPresetFrozen: AlgorithmPresetFrozenSchema,
    outputs: new Schema<Snapshot['outputs']>(
      {
        csv: { type: String },
      },
      { _id: false, versionKey: false, strict: 'throw' },
    ),
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: false,
  },
);

SnapshotSchema.plugin(paginate);

SnapshotSchema.index({ algorithmPreset: 1 });
SnapshotSchema.index({ 'algorithmPresetFrozen.key': 1 });
SnapshotSchema.index({ 'algorithmPresetFrozen.version': 1 });
SnapshotSchema.index({
  'algorithmPresetFrozen.key': 1,
  'algorithmPresetFrozen.version': 1,
});

export default SnapshotSchema as Schema<Snapshot, SnapshotModel>;
