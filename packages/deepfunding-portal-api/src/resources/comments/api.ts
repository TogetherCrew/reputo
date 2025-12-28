import type { DeepFundingClient } from '../../api/client.js';
import { endpoints } from '../../api/endpoints.js';
import type { PaginatedFetcher } from '../../shared/types/index.js';
import type { Comment, CommentsFetchOptions, CommentsResponse } from './types.js';

/**
 * Fetch comments with pagination
 */
export async function* fetchComments(
  client: DeepFundingClient,
  options: CommentsFetchOptions = {},
): PaginatedFetcher<Comment> {
  let page = options.page ?? 1;
  const limit = options.limit ?? client.config.defaultPageLimit;

  while (true) {
    const params: Record<string, string | number> = { page, limit };
    if (options.userId !== undefined) {
      params.user_id = options.userId;
    }
    if (options.proposalId !== undefined) {
      params.proposal_id = options.proposalId;
    }

    const response = await client.get<CommentsResponse>(endpoints.comments(), params);
    yield { data: response.comments, pagination: response.pagination };

    if (response.pagination.next_page === null) {
      break;
    }
    page = response.pagination.next_page;
  }
}
