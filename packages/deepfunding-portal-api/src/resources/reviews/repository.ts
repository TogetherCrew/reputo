import { eq } from 'drizzle-orm';
import { getDb } from '../../db/client.js';
import { type CreateManyOptions, chunkArray, DEFAULT_CHUNK_SIZE } from '../../shared/utils/index.js';
import { normalizeReviewToRecord } from './normalize.js';
import * as schema from './schema.js';
import type { Review } from './types.js';

/**
 * Create a review in the database
 */
export function create(data: Review): void {
  const db = getDb();
  db.drizzle.insert(schema.reviews).values(normalizeReviewToRecord(data)).run();
}

/**
 * Create multiple reviews in the database with chunking and transaction support
 *
 * @param items - Array of reviews to insert
 * @param options - Optional configuration for chunk size
 */
export function createMany(items: Review[], options?: CreateManyOptions): void {
  const db = getDb();
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunks = chunkArray(items, chunkSize);

  db.sqlite.transaction(() => {
    for (const chunk of chunks) {
      db.drizzle.insert(schema.reviews).values(chunk.map(normalizeReviewToRecord)).run();
    }
  })();
}

/**
 * Find all reviews
 */
export function findAll() {
  const db = getDb();
  return db.drizzle.select().from(schema.reviews).all();
}

/**
 * Find reviews by proposal ID
 */
export function findByProposalId(proposalId: number) {
  const db = getDb();
  return db.drizzle.select().from(schema.reviews).where(eq(schema.reviews.proposalId, proposalId)).all();
}

/**
 * Find reviews by reviewer ID
 */
export function findByReviewerId(reviewerId: number) {
  const db = getDb();
  return db.drizzle.select().from(schema.reviews).where(eq(schema.reviews.reviewerId, reviewerId)).all();
}

/**
 * Find a review by ID
 */
export function findById(reviewId: number) {
  const db = getDb();
  return db.drizzle.select().from(schema.reviews).where(eq(schema.reviews.reviewId, reviewId)).get();
}

/**
 * Reviews repository
 */
export const reviewsRepo = {
  create,
  createMany,
  findAll,
  findByProposalId,
  findByReviewerId,
  findById,
};
