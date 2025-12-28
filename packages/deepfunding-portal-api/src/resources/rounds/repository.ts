import { eq } from 'drizzle-orm';
import type { DeepFundingPortalDb } from '../../shared/types/db.js';
import * as schema from './schema.js';
import type { Round } from './types.js';

/**
 * Create a round in the database
 */
export function create(db: DeepFundingPortalDb, data: Round): void {
  const drizzle = db.drizzle;

  // Extract pool IDs from pool_id array
  const poolIds = data.pool_id && Array.isArray(data.pool_id) ? data.pool_id.map((p) => p.id) : [];

  drizzle
    .insert(schema.rounds)
    .values({
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      poolIds: JSON.stringify(poolIds),
      rawJson: JSON.stringify(data),
    })
    .run();
}

/**
 * Find all rounds
 */
export function findAll(db: DeepFundingPortalDb) {
  return db.drizzle.select().from(schema.rounds).all();
}

/**
 * Find a round by ID
 */
export function findById(db: DeepFundingPortalDb, id: number) {
  return db.drizzle.select().from(schema.rounds).where(eq(schema.rounds.id, id)).get();
}

/**
 * Rounds repository
 */
export const roundsRepo = {
  create,
  findAll,
  findById,
};
