import { eq } from 'drizzle-orm';
import type { DeepFundingPortalDb } from '../../shared/types/db.js';
import { type CreateManyOptions, chunkArray, DEFAULT_CHUNK_SIZE } from '../../shared/utils/index.js';
import { normalizeCommentToRecord } from './normalize.js';
import * as schema from './schema.js';
import type { Comment, CommentRecord } from './types.js';

/**
 * Create a comments repository bound to the given database instance.
 */
export function createCommentsRepo(db: DeepFundingPortalDb) {
  return {
    create(data: Comment): void {
      db.drizzle.insert(schema.comments).values(normalizeCommentToRecord(data)).run();
    },

    createMany(items: Comment[], options?: CreateManyOptions): void {
      const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
      const chunks = chunkArray(items, chunkSize);
      db.sqlite.transaction(() => {
        for (const chunk of chunks) {
          db.drizzle.insert(schema.comments).values(chunk.map(normalizeCommentToRecord)).run();
        }
      })();
    },

    findAll(): CommentRecord[] {
      return db.drizzle.select().from(schema.comments).all();
    },

    findByProposalId(proposalId: number): CommentRecord[] {
      return db.drizzle.select().from(schema.comments).where(eq(schema.comments.proposalId, proposalId)).all();
    },

    findByUserId(userId: number): CommentRecord[] {
      return db.drizzle.select().from(schema.comments).where(eq(schema.comments.userId, userId)).all();
    },

    findById(commentId: number): CommentRecord | undefined {
      return db.drizzle.select().from(schema.comments).where(eq(schema.comments.commentId, commentId)).get();
    },
  };
}

export type CommentsRepo = ReturnType<typeof createCommentsRepo>;
