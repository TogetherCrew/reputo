import { Schema } from 'mongoose';
import { AlgorithmPreset, AlgorithmPresetModel } from '../interfaces/index.js';
import { paginate } from '../plugins/index.js';

/**
 * Mongoose schema for AlgorithmPreset documents.
 */
const AlgorithmPresetSchema = new Schema<AlgorithmPreset, AlgorithmPresetModel>(
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
    inputs: [
      new Schema<AlgorithmPreset['inputs'][number]>(
        {
          key: { type: String, required: true },
          value: { type: Schema.Types.Mixed },
        },
        { _id: false },
      ),
    ],
    name: { type: String, minlength: 3, maxlength: 100 },
    description: { type: String, minlength: 10, maxlength: 500 },
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: false,
  },
);
AlgorithmPresetSchema.index({ key: 1, version: 1 });
AlgorithmPresetSchema.plugin(paginate);

export default AlgorithmPresetSchema as Schema<AlgorithmPreset, AlgorithmPresetModel>;
