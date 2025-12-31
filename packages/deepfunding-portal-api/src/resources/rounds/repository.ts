import { eq } from 'drizzle-orm';
import { getDb } from '../../db/client.js';
import { type CreateManyOptions, chunkArray, DEFAULT_CHUNK_SIZE } from '../../shared/utils/index.js';
import { normalizeRoundToRecord } from './normalize.js';
import * as schema from './schema.js';
import type { Round } from './types.js';

/**
 * Create a round in the database
 */
export function create(data: Round): void {
  const db = getDb();
  db.drizzle.insert(schema.rounds).values(normalizeRoundToRecord(data)).run();
}

/**
 * Create multiple rounds in the database with chunking and transaction support
 *
 * @param items - Array of rounds to insert
 * @param options - Optional configuration for chunk size
 */
export function createMany(items: Round[], options?: CreateManyOptions): void {
  const db = getDb();
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunks = chunkArray(items, chunkSize);

  db.sqlite.transaction(() => {
    for (const chunk of chunks) {
      db.drizzle.insert(schema.rounds).values(chunk.map(normalizeRoundToRecord)).run();
    }
  })();
}

/**
 * Find all rounds
 */
export function findAll() {
  const db = getDb();
  return db.drizzle.select().from(schema.rounds).all();
}

/**
 * Find a round by ID
 */
export function findById(id: number) {
  const db = getDb();
  return db.drizzle.select().from(schema.rounds).where(eq(schema.rounds.id, id)).get();
}

/**
 * Rounds repository
 */
export const roundsRepo = {
  create,
  createMany,
  findAll,
  findById,
};
