import { eq } from 'drizzle-orm';
import type { DeepFundingPortalDb } from '../../shared/types/db.js';
import * as schema from './schema.js';
import type { UserListItem } from './types.js';

/**
 * Create a user in the database
 */
export function create(db: DeepFundingPortalDb, data: UserListItem): void {
  const drizzle = db.drizzle;

  drizzle
    .insert(schema.users)
    .values({
      id: data.id,
      collectionId: data.collection_id,
      userName: data.user_name,
      email: data.email,
      totalProposals: data.total_proposals,
      rawJson: JSON.stringify(data),
    })
    .run();
}

/**
 * Find all users
 */
export function findAll(db: DeepFundingPortalDb) {
  return db.drizzle.select().from(schema.users).all();
}

/**
 * Find a user by ID
 */
export function findById(db: DeepFundingPortalDb, id: number) {
  return db.drizzle.select().from(schema.users).where(eq(schema.users.id, id)).get();
}

/**
 * Users repository
 */
export const usersRepo = {
  create,
  findAll,
  findById,
};
