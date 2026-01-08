import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Proposals table
 */
export const proposals = sqliteTable(
  'proposals',
  {
    id: integer('id').primaryKey(),
    roundId: integer('round_id').notNull(),
    poolId: integer('pool_id').notNull(),
    proposerId: integer('proposer_id').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    link: text('link').notNull(),
    featureImage: text('feature_image').notNull(),
    requestedAmount: text('requested_amount').notNull(),
    awardedAmount: text('awarded_amount').notNull(),
    isAwarded: integer('is_awarded', { mode: 'boolean' }).notNull(),
    isCompleted: integer('is_completed', { mode: 'boolean' }).notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at'),
    teamMembers: text('team_members').notNull(),
    rawJson: text('raw_json').notNull(),
  },
  (table) => [index('idx_proposals_round_id').on(table.roundId), index('idx_proposals_pool_id').on(table.poolId)],
);
