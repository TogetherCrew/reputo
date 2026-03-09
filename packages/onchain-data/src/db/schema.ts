import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Metadata table for storing key-value pairs
 */
export const meta = sqliteTable('meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export * from '../resources/syncCursors/schema.js';
export * from '../resources/syncRuns/schema.js';
export * from '../resources/transfers/schema.js';
