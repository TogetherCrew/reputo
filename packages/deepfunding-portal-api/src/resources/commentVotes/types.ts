import type { Pagination, PaginationOptions } from '../../shared/types/index.js';

/**
 * Vote type enum
 */
export type VoteType = 'upvote' | 'downvote';

/**
 * CommentVote entity from API response
 */
export type CommentVote = {
  voter_id: number;
  comment_id: number;
  vote_type: VoteType;
  created_at: string;
  [key: string]: unknown;
};

/**
 * CommentVotes API response
 */
export type CommentVoteApiResponse = {
  votes: CommentVote[];
  pagination: Pagination;
};

/**
 * CommentVote database record
 */
export type CommentVoteRecord = {
  voterId: number;
  commentId: number;
  voteType: string;
  createdAt: string | null;
  rawJson: string;
};

/**
 * Options for fetching comment votes
 */
export type CommentVoteFetchOptions = PaginationOptions & {
  /** Filter by voter ID */
  voterId?: number;
  /** Filter by comment ID */
  commentId?: number;
};
