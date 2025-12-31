/**
 * Review normalization - transforms API response to DB record format
 */
import type { Review, ReviewRecord } from './types.js';

/**
 * Normalize a Review API response to a database record
 *
 * @param data - The review data from the API
 * @returns The normalized review record for database insertion
 * @note The reviewId is not included - the database will auto-generate it
 */
export function normalizeReviewToRecord(data: Review): Omit<ReviewRecord, 'reviewId'> {
  return {
    proposalId: data.proposal_id ?? null,
    reviewerId: data.reviewer_id ?? null,
    reviewType: data.review_type,
    overallRating: data.overall_rating,
    feasibilityRating: data.feasibility_rating,
    viabilityRating: data.viability_rating,
    desirabilityRating: data.desirability_rating,
    usefulnessRating: data.usefulness_rating,
    createdAt: data.created_at ?? null,
    rawJson: JSON.stringify(data),
  };
}
