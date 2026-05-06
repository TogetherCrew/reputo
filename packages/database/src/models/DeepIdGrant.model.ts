import { model } from 'mongoose';
import { DeepIdGrantSchema } from '../schemas/index.js';
import { MODEL_NAMES } from '../shared/constants/index.js';
import type { DeepIdGrant, DeepIdGrantModel } from '../shared/types/index.js';

/**
 * Mongoose model for DeepIdGrant documents.
 */
export default model<DeepIdGrant, DeepIdGrantModel>(MODEL_NAMES.DEEP_ID_GRANT, DeepIdGrantSchema);
