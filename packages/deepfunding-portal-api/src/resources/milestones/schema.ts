import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Milestones table
 */
export const milestones = sqliteTable('milestones', {
  id: integer('id').primaryKey(),
  proposalId: integer('proposal_id').notNull(),
  title: text('title').notNull(),
  status: text('status').notNull(),
  description: text('description').notNull(),
  developmentDescription: text('development_description').notNull(),
  budget: integer('budget').notNull(),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
  rawJson: text('raw_json').notNull(),
});
