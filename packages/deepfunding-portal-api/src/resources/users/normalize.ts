/**
 * User normalization - transforms API response to DB record format
 */
import type { User, UserRecord } from './types.js';

/**
 * Normalize a User API response to a database record
 *
 * @param data - The user data from the API
 * @returns The normalized user record for database insertion
 */
export function normalizeUserToRecord(data: User): UserRecord {
  return {
    id: data.id,
    collectionId: data.collection_id,
    userName: data.user_name,
    email: data.email,
    totalProposals: data.total_proposals,
    rawJson: JSON.stringify(data),
  };
}
