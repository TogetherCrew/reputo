/**
 * Comment vote normalization - transforms API response to DB record format
 */
import type { CommentVote, CommentVoteRecord } from './types.js';

/**
 * Normalize a CommentVote API response to a database record
 *
 * @param data - The comment vote data from the API
 * @returns The normalized comment vote record for database insertion
 */
export function normalizeCommentVoteToRecord(data: CommentVote): CommentVoteRecord {
  return {
    voterId: data.voter_id,
    commentId: data.comment_id,
    voteType: data.vote_type,
    createdAt: data.created_at ?? null,
    rawJson: JSON.stringify(data),
  };
}
