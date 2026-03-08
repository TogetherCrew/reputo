import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const transfers = sqliteTable(
  'transfers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chainId: text('chain_id').notNull(),
    blockNumber: integer('block_number').notNull(),
    blockHash: text('block_hash').notNull(),
    blockTimestamp: text('block_timestamp').notNull(),
    transactionHash: text('transaction_hash').notNull(),
    logIndex: integer('log_index').notNull(),
    fromAddress: text('from_address').notNull(),
    toAddress: text('to_address').notNull(),
    tokenAddress: text('token_address').notNull(),
    value: text('value').notNull(),
    assetCategory: text('asset_category'),
    rawJson: text('raw_json').notNull(),
  },
  (table) => ({
    chainTxLogIdx: uniqueIndex('uq_transfers_chain_tx_log').on(table.chainId, table.transactionHash, table.logIndex),
  }),
);
