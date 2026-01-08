import { eq } from 'drizzle-orm';
import { getDb } from '../../db/client.js';
import { type CreateManyOptions, chunkArray, DEFAULT_CHUNK_SIZE } from '../../shared/utils/index.js';
import { normalizeUserToRecord } from './normalize.js';
import * as schema from './schema.js';
import type { User, UserRecord } from './types.js';

/**
 * Create a user in the database
 */
export function create(data: User): void {
  const db = getDb();
  db.drizzle.insert(schema.users).values(normalizeUserToRecord(data)).run();
}

/**
 * Create multiple users in the database with chunking and transaction support
 *
 * @param items - Array of users to insert
 * @param options - Optional configuration for chunk size
 */
export function createMany(items: User[], options?: CreateManyOptions): void {
  const db = getDb();
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunks = chunkArray(items, chunkSize);

  db.sqlite.transaction(() => {
    for (const chunk of chunks) {
      db.drizzle.insert(schema.users).values(chunk.map(normalizeUserToRecord)).run();
    }
  })();
}

/**
 * Find all users
 */
export function findAll(): UserRecord[] {
  const db = getDb();
  return db.drizzle.select().from(schema.users).all();
}

/**
 * Find a user by ID
 */
export function findById(id: number): UserRecord | undefined {
  const db = getDb();
  return db.drizzle.select().from(schema.users).where(eq(schema.users.id, id)).get();
}

/**
 * Users repository
 */
export const usersRepo = {
  create,
  createMany,
  findAll,
  findById,
};
