import { eq } from 'drizzle-orm';
import type { DeepFundingPortalDb } from '../../shared/types/db.js';
import { type CreateManyOptions, chunkArray, DEFAULT_CHUNK_SIZE } from '../../shared/utils/index.js';
import { normalizeCommentVoteToRecord } from './normalize.js';
import * as schema from './schema.js';
import type { CommentVote, CommentVoteRecord } from './types.js';

/**
 * Create a comment-votes repository bound to the given database instance.
 */
export function createCommentVotesRepo(db: DeepFundingPortalDb) {
  return {
    create(data: CommentVote): void {
      db.drizzle.insert(schema.commentVotes).values(normalizeCommentVoteToRecord(data)).run();
    },

    createMany(items: CommentVote[], options?: CreateManyOptions): void {
      const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
      const chunks = chunkArray(items, chunkSize);
      db.sqlite.transaction(() => {
        for (const chunk of chunks) {
          db.drizzle.insert(schema.commentVotes).values(chunk.map(normalizeCommentVoteToRecord)).run();
        }
      })();
    },

    findAll(): CommentVoteRecord[] {
      return db.drizzle.select().from(schema.commentVotes).all();
    },

    findByCommentId(commentId: number): CommentVoteRecord[] {
      return db.drizzle.select().from(schema.commentVotes).where(eq(schema.commentVotes.commentId, commentId)).all();
    },

    findByVoterId(voterId: number): CommentVoteRecord[] {
      return db.drizzle.select().from(schema.commentVotes).where(eq(schema.commentVotes.voterId, voterId)).all();
    },
  };
}

export type CommentVotesRepo = ReturnType<typeof createCommentVotesRepo>;
