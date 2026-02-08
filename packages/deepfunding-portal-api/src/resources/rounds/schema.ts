import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Funding rounds table
 */
export const rounds = sqliteTable('rounds', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  poolIds: text('pool_ids').notNull(),
  rawJson: text('raw_json').notNull(),
});
