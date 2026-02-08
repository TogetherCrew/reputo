import type { CommentRecord } from '@reputo/deepfunding-portal-api';

/**
 * Build a map of comment IDs to their author user IDs.
 *
 * @param comments - Array of comment records
 * @returns Map of comment ID to author user ID
 */
export function buildCommentAuthorMap(comments: CommentRecord[]): Map<number, number> {
  const authorMap = new Map<number, number>();
  for (const comment of comments) {
    authorMap.set(comment.commentId, comment.userId);
  }
  return authorMap;
}
