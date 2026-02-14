import { eq } from 'drizzle-orm';
import type { DeepFundingPortalDb } from '../../shared/types/db.js';
import { type CreateManyOptions, chunkArray, DEFAULT_CHUNK_SIZE } from '../../shared/utils/index.js';
import { normalizeReviewToRecord } from './normalize.js';
import * as schema from './schema.js';
import type { Review, ReviewRecord } from './types.js';

/**
 * Create a reviews repository bound to the given database instance.
 */
export function createReviewsRepo(db: DeepFundingPortalDb) {
  return {
    create(data: Review): void {
      db.drizzle.insert(schema.reviews).values(normalizeReviewToRecord(data)).run();
    },

    createMany(items: Review[], options?: CreateManyOptions): void {
      const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
      const chunks = chunkArray(items, chunkSize);
      db.sqlite.transaction(() => {
        for (const chunk of chunks) {
          db.drizzle.insert(schema.reviews).values(chunk.map(normalizeReviewToRecord)).run();
        }
      })();
    },

    findAll(): ReviewRecord[] {
      return db.drizzle.select().from(schema.reviews).all();
    },

    findByProposalId(proposalId: number): ReviewRecord[] {
      return db.drizzle.select().from(schema.reviews).where(eq(schema.reviews.proposalId, proposalId)).all();
    },

    findByReviewerId(reviewerId: number): ReviewRecord[] {
      return db.drizzle.select().from(schema.reviews).where(eq(schema.reviews.reviewerId, reviewerId)).all();
    },

    findById(reviewId: number): ReviewRecord | undefined {
      return db.drizzle.select().from(schema.reviews).where(eq(schema.reviews.reviewId, reviewId)).get();
    },
  };
}

export type ReviewsRepo = ReturnType<typeof createReviewsRepo>;
