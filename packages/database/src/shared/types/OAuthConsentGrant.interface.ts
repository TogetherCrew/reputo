import type { HydratedDocument, Model, Types } from 'mongoose';
import type { OAuthProvider } from '../constants/index.js';

/**
 * Interface defining the transient OAuth consent grant state.
 *
 * Provider tokens and user-derived data are never persisted in this collection.
 */
export interface OAuthConsentGrant {
  /** Upstream OAuth provider identifier */
  provider: OAuthProvider;
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
 * Type representing a hydrated OAuthConsentGrant document with explicit _id.
 */
export type OAuthConsentGrantDoc = HydratedDocument<OAuthConsentGrant> & { _id: Types.ObjectId };

/**
 * OAuthConsentGrant document with _id for lean query results.
 */
export type OAuthConsentGrantWithId = OAuthConsentGrant & { _id: Types.ObjectId };

/**
 * Mongoose model interface for OAuthConsentGrant documents.
 */
export interface OAuthConsentGrantModel extends Model<OAuthConsentGrant> {}
