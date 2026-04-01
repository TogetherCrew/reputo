import type { HydratedDocument, Model, Types } from 'mongoose';
import type { DeepIdProvider } from '../constants/index.js';

/**
 * Interface defining the structure of a Deep ID user profile persisted by the auth subsystem.
 */
export interface DeepIdUser {
  /** Upstream auth provider identifier */
  provider: DeepIdProvider;
  /** Stable DID returned by the provider */
  did: string;
  /** Optional primary email address */
  email?: string;
  /** Whether the provider marked the email as verified */
  emailVerified: boolean;
  /** Full display name */
  name?: string;
  /** Given name from the provider profile */
  givenName?: string;
  /** Family name from the provider profile */
  familyName?: string;
  /** Optional profile image URL */
  picture?: string;
  /** Wallet addresses linked to the identity */
  walletAddresses: string[];
  /** Whether the user has completed KYC at the provider */
  kycVerified: boolean;
  /** Authentication methods reported by the provider */
  amr: string[];
  /** Timestamp of the latest successful login */
  lastLoginAt?: Date;
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
