import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const syncRuns = sqliteTable('sync_runs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  chainId: text('chain_id').notNull(),
  tokenAddress: text('token_address').notNull(),
  requestedFromBlock: integer('requested_from_block').notNull(),
  requestedToBlock: integer('requested_to_block').notNull(),
  effectiveToBlock: integer('effective_to_block'),
  status: text('status').notNull(),
  errorSummary: text('error_summary'),
  startedAt: text('started_at').notNull(),
  completedAt: text('completed_at'),
});
