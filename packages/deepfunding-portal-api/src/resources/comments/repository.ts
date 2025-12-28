import { eq } from 'drizzle-orm';
import type { DeepFundingPortalDb } from '../../shared/types/db.js';
import * as schema from './schema.js';
import type { Comment } from './types.js';

/**
 * Create a comment in the database
 */
export function create(db: DeepFundingPortalDb, data: Comment): void {
  db.drizzle
    .insert(schema.comments)
    .values({
      commentId: data.comment_id,
      parentId: data.parent_id,
      isReply: data.is_reply,
      userId: data.user_id,
      proposalId: data.proposal_id,
      content: data.content,
      commentVotes: data.comment_votes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      rawJson: JSON.stringify(data),
    })
    .run();
}

/**
 * Find all comments
 */
export function findAll(db: DeepFundingPortalDb) {
  return db.drizzle.select().from(schema.comments).all();
}

/**
 * Find comments by proposal ID
 */
export function findByProposalId(db: DeepFundingPortalDb, proposalId: string) {
  return db.drizzle.select().from(schema.comments).where(eq(schema.comments.proposalId, proposalId)).all();
}

/**
 * Find comments by user ID
 */
export function findByUserId(db: DeepFundingPortalDb, userId: string) {
  return db.drizzle.select().from(schema.comments).where(eq(schema.comments.userId, userId)).all();
}

/**
 * Find a comment by ID
 */
export function findById(db: DeepFundingPortalDb, commentId: string) {
  return db.drizzle.select().from(schema.comments).where(eq(schema.comments.commentId, commentId)).get();
}

/**
 * Comments repository
 */
export const commentsRepo = {
  create,
  findAll,
  findByProposalId,
  findByUserId,
  findById,
};
