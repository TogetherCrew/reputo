import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Funding pools table
 */
export const pools = sqliteTable('pools', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  maxFundingAmount: text('max_funding_amount').notNull(),
  description: text('description').notNull(),
  rawJson: text('raw_json').notNull(),
});
