import { Schema } from 'mongoose';
import { AUTH_PROVIDERS, DeepIdProvider } from '../shared/constants/index.js';
import type { DeepIdUser, DeepIdUserModel } from '../shared/types/index.js';

/**
 * Mongoose schema for DeepIdUser documents.
 */
const DeepIdUserSchema = new Schema<DeepIdUser, DeepIdUserModel>(
  {
    provider: {
      type: String,
      enum: AUTH_PROVIDERS,
      required: true,
      default: DeepIdProvider,
      immutable: true,
    },
    did: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      trim: true,
    },
    givenName: {
      type: String,
      trim: true,
    },
    familyName: {
      type: String,
      trim: true,
    },
    picture: {
      type: String,
      trim: true,
    },
    walletAddresses: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    kycVerified: {
      type: Boolean,
      default: false,
    },
    amr: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: false,
  },
);

DeepIdUserSchema.index({ provider: 1, did: 1 }, { unique: true });
DeepIdUserSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $exists: true, $type: 'string' },
    },
  },
);

export default DeepIdUserSchema as Schema<DeepIdUser, DeepIdUserModel>;
