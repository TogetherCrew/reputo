import type { HydratedDocument, Model, Types } from 'mongoose';
import type { DeepIdProvider } from '../constants/index.js';

/**
 * Interface defining the structure of an authenticated provider session.
 *
 * Provider tokens are persisted as ciphertext-only strings and must be explicitly
 * selected when queried because they are omitted from default serialization.
 */
export interface AuthSession {
  /** Stable session identifier used by upstream auth flows */
  sessionId: string;
  /** Upstream auth provider identifier */
  provider: DeepIdProvider;
  /** Associated DeepIdUser document identifier */
  userId: Types.ObjectId | string;
  /** Encrypted access token payload */
  accessTokenCiphertext: string;
  /** Encrypted refresh token payload */
  refreshTokenCiphertext: string;
  /** Access token expiry timestamp */
  accessTokenExpiresAt: Date;
  /** Refresh token expiry timestamp */
  refreshTokenExpiresAt: Date;
  /** Granted scopes associated with the session */
  scope: string[];
  /** OIDC nonce used during the auth flow */
  nonce: string;
  /** CSRF protection state used during the auth flow */
  state: string;
  /** PKCE verifier used during the auth flow */
  codeVerifier: string;
  /** Timestamp of the last successful token refresh */
  lastRefreshedAt?: Date;
  /** Timestamp when the session was revoked */
  revokedAt?: Date;
  /** Session expiry timestamp used for garbage collection */
  expiresAt: Date;
  /** Document creation timestamp */
  createdAt?: Date;
  /** Document last update timestamp */
  updatedAt?: Date;
}

/**
 * Type representing a hydrated AuthSession document with explicit _id.
 */
export type AuthSessionDoc = HydratedDocument<AuthSession> & { _id: Types.ObjectId };

/**
 * AuthSession document with _id for lean query results.
 */
export type AuthSessionWithId = AuthSession & { _id: Types.ObjectId };

/**
 * Mongoose model interface for AuthSession documents.
 */
export interface AuthSessionModel extends Model<AuthSession> {}
