import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Metadata table for storing key-value pairs
 */
export const meta = sqliteTable('meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export * from '../resources/comments/schema.js';
export * from '../resources/commentVotes/schema.js';
export * from '../resources/milestones/schema.js';
export * from '../resources/pools/schema.js';
export * from '../resources/proposals/schema.js';
export * from '../resources/reviews/schema.js';
export * from '../resources/rounds/schema.js';
export * from '../resources/users/schema.js';
