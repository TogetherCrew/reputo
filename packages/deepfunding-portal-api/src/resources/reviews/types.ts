import type { Pagination, PaginationOptions } from '../../shared/types/index.js';

/**
 * Review type
 */
export type ReviewType = 'expert' | 'community';

/**
 * Review
 */
export type Review = {
  review_id: number | string;
  proposal_id: number | string;
  reviewer_id: number | string;
  review_type: ReviewType;
  overall_rating: string;
  feasibility_rating: string;
  viability_rating: string;
  desirability_rating: string;
  usefulness_rating: string;
  created_at: string;
  [key: string]: unknown;
};

/**
 * Reviews API response
 */
export type ReviewsResponse = {
  reviews: Review[];
  pagination: Pagination;
};

/**
 * Options for fetching reviews
 */
export type ReviewsFetchOptions = PaginationOptions & {
  /** Filter by reviewer ID */
  reviewerId?: number | string;
  /** Filter by proposal ID */
  proposalId?: number | string;
  /** Filter by review type */
  type?: ReviewType;
};
