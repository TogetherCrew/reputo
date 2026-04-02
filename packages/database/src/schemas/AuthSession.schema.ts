import { Schema } from 'mongoose';
import { AUTH_PROVIDERS, AUTH_SESSION_PRIVATE_FIELDS, DeepIdProvider, MODEL_NAMES } from '../shared/constants/index.js';
import type { AuthSession, AuthSessionModel } from '../shared/types/index.js';

function stripPrivateFields(ret: Record<string, unknown>): Record<string, unknown> {
  for (const field of AUTH_SESSION_PRIVATE_FIELDS) {
    delete ret[field];
  }

  return ret;
}

/**
 * Mongoose schema for AuthSession documents.
 */
const AuthSessionSchema = new Schema<AuthSession, AuthSessionModel>(
  {
    sessionId: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
    },
    provider: {
      type: String,
      enum: AUTH_PROVIDERS,
      required: true,
      default: DeepIdProvider,
      immutable: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.DEEP_ID_USER,
      required: true,
    },
    accessTokenCiphertext: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },
    refreshTokenCiphertext: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },
    accessTokenExpiresAt: {
      type: Date,
      required: true,
    },
    refreshTokenExpiresAt: {
      type: Date,
      required: true,
    },
    scope: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    state: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },
    codeVerifier: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },
    lastRefreshedAt: {
      type: Date,
    },
    revokedAt: {
      type: Date,
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

AuthSessionSchema.index({ sessionId: 1 }, { unique: true });
AuthSessionSchema.index({ userId: 1 });
AuthSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
AuthSessionSchema.index({ revokedAt: 1 });

export default AuthSessionSchema as Schema<AuthSession, AuthSessionModel>;
