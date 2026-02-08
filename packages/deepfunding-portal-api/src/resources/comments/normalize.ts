/**
 * Comment normalization - transforms API response to DB record format
 */
import type { Comment, CommentRecord } from './types.js';

/**
 * Normalize a Comment API response to a database record
 *
 * @param data - The comment data from the API
 * @returns The normalized comment record for database insertion
 */
export function normalizeCommentToRecord(data: Comment): CommentRecord {
  return {
    commentId: data.comment_id,
    parentId: data.parent_id,
    isReply: data.is_reply,
    userId: data.user_id,
    proposalId: data.proposal_id,
    content: data.content,
    commentVotes: String(data.comment_votes),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    rawJson: JSON.stringify(data),
  };
}
