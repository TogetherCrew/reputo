import { model } from 'mongoose';
import { AuthSessionSchema } from '../schemas/index.js';
import { MODEL_NAMES } from '../shared/constants/index.js';
import type { AuthSession, AuthSessionModel } from '../shared/types/index.js';

/**
 * Mongoose model for AuthSession documents.
 */
export default model<AuthSession, AuthSessionModel>(MODEL_NAMES.AUTH_SESSION, AuthSessionSchema);
