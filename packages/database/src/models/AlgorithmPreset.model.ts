import { model } from 'mongoose';
import { AlgorithmPresetSchema } from '../schemas/index.js';
import { MODEL_NAMES } from '../shared/constants/index.js';
import type { AlgorithmPreset, AlgorithmPresetModel } from '../shared/types/index.js';

/**
 * Mongoose model for AlgorithmPreset documents.
 */
export default model<AlgorithmPreset, AlgorithmPresetModel>(MODEL_NAMES.ALGORITHM_PRESET, AlgorithmPresetSchema);
