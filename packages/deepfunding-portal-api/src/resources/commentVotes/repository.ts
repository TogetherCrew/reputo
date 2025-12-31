import { eq } from 'drizzle-orm';
import { getDb } from '../../db/client.js';
import { type CreateManyOptions, chunkArray, DEFAULT_CHUNK_SIZE } from '../../shared/utils/index.js';
import { normalizeCommentVoteToRecord } from './normalize.js';
import * as schema from './schema.js';
import type { CommentVote } from './types.js';

/**
 * Create a comment vote in the database
 */
export function create(data: CommentVote): void {
  const db = getDb();
  db.drizzle.insert(schema.commentVotes).values(normalizeCommentVoteToRecord(data)).run();
}

/**
 * Create multiple comment votes in the database with chunking and transaction support
 *
 * @param items - Array of comment votes to insert
 * @param options - Optional configuration for chunk size
 */
export function createMany(items: CommentVote[], options?: CreateManyOptions): void {
  const db = getDb();
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunks = chunkArray(items, chunkSize);

  db.sqlite.transaction(() => {
    for (const chunk of chunks) {
      db.drizzle.insert(schema.commentVotes).values(chunk.map(normalizeCommentVoteToRecord)).run();
    }
  })();
}

/**
 * Find all comment votes
 */
export function findAll() {
  const db = getDb();
  return db.drizzle.select().from(schema.commentVotes).all();
}

/**
 * Find comment votes by comment ID
 */
export function findByCommentId(commentId: number) {
  const db = getDb();
  return db.drizzle.select().from(schema.commentVotes).where(eq(schema.commentVotes.commentId, commentId)).all();
}

/**
 * Find comment votes by voter ID
 */
export function findByVoterId(voterId: number) {
  const db = getDb();
  return db.drizzle.select().from(schema.commentVotes).where(eq(schema.commentVotes.voterId, voterId)).all();
}

/**
 * Comment votes repository
 */
export const commentVotesRepo = {
  create,
  createMany,
  findAll,
  findByCommentId,
  findByVoterId,
};
