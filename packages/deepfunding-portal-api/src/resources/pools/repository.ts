import { eq } from 'drizzle-orm';
import type { DeepFundingPortalDb } from '../../shared/types/db.js';
import * as schema from './schema.js';
import type { Pool } from './types.js';

/**
 * Create a pool in the database
 */
export function create(db: DeepFundingPortalDb, data: Pool): void {
  const drizzle = db.drizzle;

  drizzle
    .insert(schema.pools)
    .values({
      id: data.id,
      name: data.name,
      slug: data.slug,
      maxFundingAmount: data.max_funding_amount,
      description: data.description,
      rawJson: JSON.stringify(data),
    })
    .run();
}

/**
 * Find all pools
 */
export function findAll(db: DeepFundingPortalDb) {
  return db.drizzle.select().from(schema.pools).all();
}

/**
 * Find a pool by ID
 */
export function findById(db: DeepFundingPortalDb, id: number) {
  return db.drizzle.select().from(schema.pools).where(eq(schema.pools.id, id)).get();
}

/**
 * Pools repository
 */
export const poolsRepo = {
  create,
  findAll,
  findById,
};
