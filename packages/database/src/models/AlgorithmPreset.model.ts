import { model } from 'mongoose';
import { MODEL_NAMES } from '../constants/index.js';
import { type AlgorithmPreset, type AlgorithmPresetModel } from '../interfaces/index.js';
import { AlgorithmPresetSchema } from '../schemas/index.js';

/**
 * Mongoose model for AlgorithmPreset documents.
 */
const AlgorithmPresetModel: AlgorithmPresetModel = model<AlgorithmPreset, AlgorithmPresetModel>(
  MODEL_NAMES.ALGORITHM_PRESET,
  AlgorithmPresetSchema,
);

export default AlgorithmPresetModel;
