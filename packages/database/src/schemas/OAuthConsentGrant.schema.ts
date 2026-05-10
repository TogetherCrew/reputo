import { Schema } from 'mongoose';
import { OAUTH_PROVIDERS } from '../shared/constants/index.js';
import type { OAuthConsentGrant, OAuthConsentGrantModel } from '../shared/types/index.js';

const OAUTH_CONSENT_GRANT_PRIVATE_FIELDS = ['codeVerifier'] as const;

function stripPrivateFields(ret: Record<string, unknown>): Record<string, unknown> {
  for (const field of OAUTH_CONSENT_GRANT_PRIVATE_FIELDS) {
    delete ret[field];
  }

  return ret;
}

/**
 * Mongoose schema for transient OAuthConsentGrant documents.
 */
const OAuthConsentGrantSchema = new Schema<OAuthConsentGrant, OAuthConsentGrantModel>(
  {
    provider: {
      type: String,
      enum: OAUTH_PROVIDERS,
      required: true,
      trim: true,
      immutable: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
    },
    codeVerifier: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: false,
    toJSON: {
      transform: (_doc, ret) => stripPrivateFields(ret as Record<string, unknown>),
    },
    toObject: {
      transform: (_doc, ret) => stripPrivateFields(ret as Record<string, unknown>),
    },
  },
);

OAuthConsentGrantSchema.index({ provider: 1, source: 1 });
OAuthConsentGrantSchema.index({ state: 1 }, { unique: true });
OAuthConsentGrantSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default OAuthConsentGrantSchema as Schema<OAuthConsentGrant, OAuthConsentGrantModel>;
