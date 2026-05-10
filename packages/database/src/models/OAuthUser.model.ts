import { model } from 'mongoose';
import { OAuthUserSchema } from '../schemas/index.js';
import { MODEL_NAMES } from '../shared/constants/index.js';
import type { OAuthUser, OAuthUserModel } from '../shared/types/index.js';

/**
 * Mongoose model for OAuthUser documents.
 */
export default model<OAuthUser, OAuthUserModel>(MODEL_NAMES.OAUTH_USER, OAuthUserSchema);
