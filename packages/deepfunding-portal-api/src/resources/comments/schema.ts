import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Comments table
 */
export const comments = sqliteTable(
  'comments',
  {
    commentId: text('comment_id').primaryKey(),
    parentId: text('parent_id').notNull(),
    isReply: integer('is_reply', { mode: 'boolean' }).notNull(),
    userId: text('user_id').notNull(),
    proposalId: text('proposal_id').notNull(),
    content: text('content').notNull(),
    commentVotes: text('comment_votes').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    rawJson: text('raw_json').notNull(),
  },
  (table) => [index('idx_comments_proposal_id').on(table.proposalId), index('idx_comments_user_id').on(table.userId)],
);
