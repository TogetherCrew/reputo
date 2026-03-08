import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const syncCursors = sqliteTable('sync_cursors', {
  chainId: text('chain_id').notNull(),
  tokenAddress: text('token_address').notNull(),
  cursorBlock: integer('cursor_block').notNull(),
  updatedAt: text('updated_at').notNull(),
});
