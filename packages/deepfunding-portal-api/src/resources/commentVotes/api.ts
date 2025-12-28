import type { DeepFundingClient } from '../../api/client.js';
import { endpoints } from '../../api/endpoints.js';
import type { PaginatedFetcher } from '../../shared/types/index.js';
import type { CommentVote, CommentVotesFetchOptions, CommentVotesResponse } from './types.js';

/**
 * Fetch comment votes with pagination
 */
export async function* fetchCommentVotes(
  client: DeepFundingClient,
  options: CommentVotesFetchOptions = {},
): PaginatedFetcher<CommentVote> {
  let page = options.page ?? 1;
  const limit = options.limit ?? client.config.defaultPageLimit;

  while (true) {
    const params: Record<string, string | number> = { page, limit };
    if (options.voterId !== undefined) {
      params.voter_id = options.voterId;
    }
    if (options.commentId !== undefined) {
      params.comment_id = options.commentId;
    }

    const response = await client.get<CommentVotesResponse>(endpoints.commentVotes(), params);
    yield { data: response.votes, pagination: response.pagination };

    if (response.pagination.next_page === null) {
      break;
    }
    page = response.pagination.next_page;
  }
}
