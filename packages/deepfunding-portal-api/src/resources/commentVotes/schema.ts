import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Comment votes table
 */
export const commentVotes = sqliteTable(
  'comment_votes',
  {
    voterId: integer('voter_id').notNull(),
    commentId: text('comment_id').notNull(),
    voteType: text('vote_type').notNull(),
    createdAt: text('created_at'),
    rawJson: text('raw_json').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.voterId, table.commentId] }),
    index('idx_comment_votes_comment_id').on(table.commentId),
  ],
);
