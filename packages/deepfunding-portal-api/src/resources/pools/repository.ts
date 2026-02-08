import { eq } from 'drizzle-orm';
import { getDb } from '../../db/client.js';
import { type CreateManyOptions, chunkArray, DEFAULT_CHUNK_SIZE } from '../../shared/utils/index.js';
import { normalizePoolToRecord } from './normalize.js';
import * as schema from './schema.js';
import type { Pool } from './types.js';

/**
 * Create a pool in the database
 */
export function create(data: Pool): void {
  const db = getDb();
  db.drizzle.insert(schema.pools).values(normalizePoolToRecord(data)).run();
}

/**
 * Create multiple pools in the database with chunking and transaction support
 *
 * @param items - Array of pools to insert
 * @param options - Optional configuration for chunk size
 */
export function createMany(items: Pool[], options?: CreateManyOptions): void {
  const db = getDb();
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunks = chunkArray(items, chunkSize);

  db.sqlite.transaction(() => {
    for (const chunk of chunks) {
      db.drizzle.insert(schema.pools).values(chunk.map(normalizePoolToRecord)).run();
    }
  })();
}

/**
 * Find all pools
 */
export function findAll() {
  const db = getDb();
  return db.drizzle.select().from(schema.pools).all();
}

/**
 * Find a pool by ID
 */
export function findById(id: number) {
  const db = getDb();
  return db.drizzle.select().from(schema.pools).where(eq(schema.pools.id, id)).get();
}

/**
 * Pools repository
 */
export const poolsRepo = {
  create,
  createMany,
  findAll,
  findById,
};
