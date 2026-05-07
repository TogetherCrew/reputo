import { model } from 'mongoose';
import { OAuthConsentGrantSchema } from '../schemas/index.js';
import { MODEL_NAMES } from '../shared/constants/index.js';
import type { OAuthConsentGrant, OAuthConsentGrantModel } from '../shared/types/index.js';

/**
 * Mongoose model for OAuthConsentGrant documents.
 */
export default model<OAuthConsentGrant, OAuthConsentGrantModel>(
  MODEL_NAMES.OAUTH_CONSENT_GRANT,
  OAuthConsentGrantSchema,
);
