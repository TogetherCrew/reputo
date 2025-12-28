import type { Pagination, PaginationOptions } from '../../shared/types/index.js';

/**
 * Vote type
 */
export type VoteType = 'upvote' | 'downvote';

/**
 * Comment vote
 */
export type CommentVote = {
  voter_id: number;
  comment_id: string;
  vote_type: VoteType;
  created_at: string;
  [key: string]: unknown;
};

/**
 * Comment votes API response
 */
export type CommentVotesResponse = {
  votes: CommentVote[];
  pagination: Pagination;
};

/**
 * Options for fetching comment votes
 */
export type CommentVotesFetchOptions = PaginationOptions & {
  /** Filter by voter ID */
  voterId?: number | string;
  /** Filter by comment ID */
  commentId?: number | string;
};
