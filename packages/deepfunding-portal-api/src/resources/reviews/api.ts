import type { DeepFundingClient } from '../../api/client.js';
import { endpoints } from '../../api/endpoints.js';
import type { PaginatedFetcher } from '../../shared/types/index.js';
import type { Review, ReviewApiResponse, ReviewFetchOptions } from './types.js';

/**
 * Fetch reviews with pagination
 */
export async function* fetchReviews(
  client: DeepFundingClient,
  options: ReviewFetchOptions = {},
): PaginatedFetcher<Review> {
  let page = options.page ?? 1;
  const limit = options.limit ?? client.config.defaultPageLimit;

  while (true) {
    const params: Record<string, string | number> = { page, limit };
    if (options.reviewerId !== undefined) {
      params.reviewer_id = options.reviewerId;
    }
    if (options.proposalId !== undefined) {
      params.proposal_id = options.proposalId;
    }
    if (options.type !== undefined) {
      params.type = options.type;
    }
    const response = await client.get<ReviewApiResponse>(endpoints.reviews(), params);
    yield { data: response.reviews, pagination: response.pagination };

    if (response.pagination.next_page === null) {
      break;
    }
    page = response.pagination.next_page;
  }
}
