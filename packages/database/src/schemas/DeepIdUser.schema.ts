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
    sub: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
    },
    aud: {
      type: [{ type: String, trim: true }],
    },
    auth_time: {
      type: Number,
    },
    email: {
      type: String,
      trim: true,
    },
    email_verified: {
      type: Boolean,
    },
    iat: {
      type: Number,
    },
    iss: {
      type: String,
      trim: true,
    },
    picture: {
      type: String,
      trim: true,
    },
    rat: {
      type: Number,
    },
    username: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: false,
  },
);

DeepIdUserSchema.index({ provider: 1, sub: 1 }, { unique: true });

export default DeepIdUserSchema as Schema<DeepIdUser, DeepIdUserModel>;
