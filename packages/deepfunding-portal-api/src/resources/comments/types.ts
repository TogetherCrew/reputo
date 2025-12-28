import type { Pagination, PaginationOptions } from '../../shared/types/index.js';

/**
 * Comment
 */
export type Comment = {
  comment_id: string;
  parent_id: string;
  is_reply: boolean;
  user_id: string;
  proposal_id: string;
  content: string;
  comment_votes: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
};

/**
 * Comments API response
 */
export type CommentsResponse = {
  comments: Comment[];
  pagination: Pagination;
};

/**
 * Options for fetching comments
 */
export type CommentsFetchOptions = PaginationOptions & {
  /** Filter by user ID */
  userId?: string;
  /** Filter by proposal ID */
  proposalId?: string;
};
