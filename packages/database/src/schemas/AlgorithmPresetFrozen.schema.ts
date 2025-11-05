import { Schema } from 'mongoose';
import type { AlgorithmPresetFrozen } from '../interfaces/index.js';

/**
 * Mongoose schema for frozen AlgorithmPreset embedded in Snapshot documents.
 *
 * This schema represents an immutable copy of an AlgorithmPreset configuration
 * at the time a snapshot was created.
 */
export const AlgorithmPresetFrozenSchema: Schema<AlgorithmPresetFrozen> = new Schema<AlgorithmPresetFrozen>(
  {
    key: {
      type: String,
      required: true,
      immutable: true,
    },
    version: {
      type: String,
      required: true,
      immutable: true,
    },
    inputs: [
      new Schema(
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
  { timestamps: true, versionKey: false, minimize: false },
);
