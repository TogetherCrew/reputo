import { eq } from 'drizzle-orm';
import type { DeepFundingPortalDb } from '../../shared/types/db.js';
import * as schema from './schema.js';
import type { CommentVote } from './types.js';

/**
 * Create a comment vote in the database
 */
export function create(db: DeepFundingPortalDb, data: CommentVote): void {
  const drizzle = db.drizzle;

  drizzle
    .insert(schema.commentVotes)
    .values({
      voterId: data.voter_id,
      commentId: data.comment_id,
      voteType: data.vote_type,
      createdAt: data.created_at,
      rawJson: JSON.stringify(data),
    })
    .run();
}

/**
 * Find all comment votes
 */
export function findAll(db: DeepFundingPortalDb) {
  return db.drizzle.select().from(schema.commentVotes).all();
}

/**
 * Find comment votes by comment ID
 */
export function findByCommentId(db: DeepFundingPortalDb, commentId: string) {
  return db.drizzle.select().from(schema.commentVotes).where(eq(schema.commentVotes.commentId, commentId)).all();
}

/**
 * Find comment votes by voter ID
 */
export function findByVoterId(db: DeepFundingPortalDb, voterId: number) {
  return db.drizzle.select().from(schema.commentVotes).where(eq(schema.commentVotes.voterId, voterId)).all();
}

/**
 * Comment votes repository
 */
export const commentVotesRepo = {
  create,
  findAll,
  findByCommentId,
  findByVoterId,
};
