import { eq } from 'drizzle-orm';
import { getDb } from '../../db/client.js';
import { type CreateManyOptions, chunkArray, DEFAULT_CHUNK_SIZE } from '../../shared/utils/index.js';
import { normalizeCommentToRecord } from './normalize.js';
import * as schema from './schema.js';
import type { Comment } from './types.js';

/**
 * Create a comment in the database
 */
export function create(data: Comment): void {
  const db = getDb();
  db.drizzle.insert(schema.comments).values(normalizeCommentToRecord(data)).run();
}

/**
 * Create multiple comments in the database with chunking and transaction support
 *
 * @param items - Array of comments to insert
 * @param options - Optional configuration for chunk size
 */
export function createMany(items: Comment[], options?: CreateManyOptions): void {
  const db = getDb();
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunks = chunkArray(items, chunkSize);

  db.sqlite.transaction(() => {
    for (const chunk of chunks) {
      db.drizzle.insert(schema.comments).values(chunk.map(normalizeCommentToRecord)).run();
    }
  })();
}

/**
 * Find all comments
 */
export function findAll() {
  const db = getDb();
  return db.drizzle.select().from(schema.comments).all();
}

/**
 * Find comments by proposal ID
 */
export function findByProposalId(proposalId: number) {
  const db = getDb();
  return db.drizzle.select().from(schema.comments).where(eq(schema.comments.proposalId, proposalId)).all();
}

/**
 * Find comments by user ID
 */
export function findByUserId(userId: number) {
  const db = getDb();
  return db.drizzle.select().from(schema.comments).where(eq(schema.comments.userId, userId)).all();
}

/**
 * Find a comment by ID
 */
export function findById(commentId: number) {
  const db = getDb();
  return db.drizzle.select().from(schema.comments).where(eq(schema.comments.commentId, commentId)).get();
}

/**
 * Comments repository
 */
export const commentsRepo = {
  create,
  createMany,
  findAll,
  findByProposalId,
  findByUserId,
  findById,
};
