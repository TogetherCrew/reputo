import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Users table
 */
export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  collectionId: text('collection_id').notNull(),
  userName: text('user_name').notNull(),
  email: text('email').notNull(),
  totalProposals: integer('total_proposals').notNull(),
  rawJson: text('raw_json').notNull(),
});
