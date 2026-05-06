import type { HydratedDocument, Model, Types } from 'mongoose';

/**
 * Interface defining the transient OAuth consent grant state.
 *
 * Deep ID tokens and user-derived data are never persisted in this collection.
 */
export interface DeepIdGrant {
  /** Configured source slug that initiated the consent flow */
  source: string;
  /** Opaque CSRF state used to resume the callback */
  state: string;
  /** PKCE verifier used only during code exchange */
  codeVerifier: string;
  /** Expiry timestamp used by MongoDB TTL cleanup */
  expiresAt: Date;
  /** Document creation timestamp */
  createdAt?: Date;
  /** Document last update timestamp */
  updatedAt?: Date;
}

/**
 * Type representing a hydrated DeepIdGrant document with explicit _id.
 */
export type DeepIdGrantDoc = HydratedDocument<DeepIdGrant> & { _id: Types.ObjectId };

/**
 * DeepIdGrant document with _id for lean query results.
 */
export type DeepIdGrantWithId = DeepIdGrant & { _id: Types.ObjectId };

/**
 * Mongoose model interface for DeepIdGrant documents.
 */
export interface DeepIdGrantModel extends Model<DeepIdGrant> {}
