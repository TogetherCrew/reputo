import { eq } from 'drizzle-orm';
import type { DeepFundingPortalDb } from '../../shared/types/db.js';
import * as schema from './schema.js';
import type { Review } from './types.js';

/**
 * Create a review in the database
 */
export function create(db: DeepFundingPortalDb, data: Review): void {
  const drizzle = db.drizzle;

  drizzle
    .insert(schema.reviews)
    .values({
      reviewId: data.review_id as string,
      proposalId: data.proposal_id as string | null,
      reviewerId: data.reviewer_id as string | null,
      reviewType: data.review_type,
      overallRating: data.overall_rating,
      feasibilityRating: data.feasibility_rating,
      viabilityRating: data.viability_rating,
      desirabilityRating: data.desirability_rating,
      usefulnessRating: data.usefulness_rating,
      createdAt: data.created_at,
      rawJson: JSON.stringify(data),
    })
    .run();
}

/**
 * Find all reviews
 */
export function findAll(db: DeepFundingPortalDb) {
  return db.drizzle.select().from(schema.reviews).all();
}

/**
 * Find reviews by proposal ID
 */
export function findByProposalId(db: DeepFundingPortalDb, proposalId: string) {
  return db.drizzle.select().from(schema.reviews).where(eq(schema.reviews.proposalId, proposalId)).all();
}

/**
 * Find reviews by reviewer ID
 */
export function findByReviewerId(db: DeepFundingPortalDb, reviewerId: string) {
  return db.drizzle.select().from(schema.reviews).where(eq(schema.reviews.reviewerId, reviewerId)).all();
}

/**
 * Find a review by ID
 */
export function findById(db: DeepFundingPortalDb, reviewId: string) {
  return db.drizzle.select().from(schema.reviews).where(eq(schema.reviews.reviewId, reviewId)).get();
}

/**
 * Reviews repository
 */
export const reviewsRepo = {
  create,
  findAll,
  findByProposalId,
  findByReviewerId,
  findById,
};
