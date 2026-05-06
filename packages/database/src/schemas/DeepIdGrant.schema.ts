import { Schema } from 'mongoose';
import type { DeepIdGrant, DeepIdGrantModel } from '../shared/types/index.js';

const DEEP_ID_GRANT_PRIVATE_FIELDS = ['codeVerifier'] as const;

function stripPrivateFields(ret: Record<string, unknown>): Record<string, unknown> {
  for (const field of DEEP_ID_GRANT_PRIVATE_FIELDS) {
    delete ret[field];
  }

  return ret;
}

/**
 * Mongoose schema for transient DeepIdGrant documents.
 */
const DeepIdGrantSchema = new Schema<DeepIdGrant, DeepIdGrantModel>(
  {
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

DeepIdGrantSchema.index({ source: 1 });
DeepIdGrantSchema.index({ state: 1 }, { unique: true });
DeepIdGrantSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default DeepIdGrantSchema as Schema<DeepIdGrant, DeepIdGrantModel>;
