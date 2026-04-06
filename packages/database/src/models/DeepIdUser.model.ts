import { model } from 'mongoose';
import { DeepIdUserSchema } from '../schemas/index.js';
import { MODEL_NAMES } from '../shared/constants/index.js';
import type { DeepIdUser, DeepIdUserModel } from '../shared/types/index.js';

/**
 * Mongoose model for DeepIdUser documents.
 */
export default model<DeepIdUser, DeepIdUserModel>(MODEL_NAMES.DEEP_ID_USER, DeepIdUserSchema);
