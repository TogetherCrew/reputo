import { Schema } from 'mongoose';
import { AlgorithmPreset, AlgorithmPresetModel } from '../interfaces/index.js';

/**
 * Mongoose schema for AlgorithmPreset documents.
 */
const AlgorithmPresetSchema = new Schema<AlgorithmPreset, AlgorithmPresetModel>(
  {
    spec: new Schema<AlgorithmPreset['spec']>(
      {
        key: {
          type: String,
          required: true,
          index: true,
          immutable: true,
        },
        version: {
          type: String,
          required: true,
          index: true,
          immutable: true,
        },
      },
      { _id: false },
    ),
    inputs: new Schema<AlgorithmPreset['inputs'][number]>(
      {
        key: { type: String, required: true },
        value: { type: Schema.Types.Mixed },
      },
      { _id: false },
    ),
    name: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: false,
  },
);

AlgorithmPresetSchema.index({ 'spec.key': 1, 'spec.version': 1 });

export default AlgorithmPresetSchema as Schema<AlgorithmPreset, AlgorithmPresetModel>;
