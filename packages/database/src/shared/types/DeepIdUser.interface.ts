import type { HydratedDocument, Model, Types } from 'mongoose';
import type { DeepIdProvider } from '../constants/index.js';

/**
 * Interface defining the structure of a Deep ID user profile persisted by the auth subsystem.
 */
export interface DeepIdUser {
  /** Upstream auth provider identifier */
  provider: DeepIdProvider;
  /** Stable subject returned by the provider */
  sub: string;
  /** Intended audience(s) returned by the provider */
  aud?: string[];
  /** Upstream authentication time */
  auth_time?: number;
  /** Optional primary email address */
  email?: string;
  /** Whether the provider marked the email as verified */
  email_verified?: boolean;
  /** Upstream issued-at timestamp */
  iat?: number;
  /** Upstream issuer */
  iss?: string;
  /** Optional profile image URL */
  picture?: string;
  /** Upstream rat timestamp */
  rat?: number;
  /** Provider username */
  username?: string;
  /** Document creation timestamp */
  createdAt?: Date;
  /** Document last update timestamp */
  updatedAt?: Date;
}

/**
 * Type representing a hydrated DeepIdUser document with explicit _id.
 */
export type DeepIdUserDoc = HydratedDocument<DeepIdUser> & { _id: Types.ObjectId };

/**
 * DeepIdUser document with _id for lean query results.
 */
export type DeepIdUserWithId = DeepIdUser & { _id: Types.ObjectId };

/**
 * Mongoose model interface for DeepIdUser documents.
 */
export interface DeepIdUserModel extends Model<DeepIdUser> {}
