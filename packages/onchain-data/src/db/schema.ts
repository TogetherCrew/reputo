import { EntitySchema } from 'typeorm';

export interface TokenTransferEntity {
  token_chain: string;
  block_number: string;
  transaction_hash: string;
  log_index: number;
  from_address: string | null;
  to_address: string | null;
  amount: string;
  block_timestamp: string | null;
}

export const TokenTransferSchema = new EntitySchema<TokenTransferEntity>({
  name: 'token_transfer',
  tableName: 'token_transfers',
  columns: {
    token_chain: { type: 'text', primary: true },
    transaction_hash: { type: 'text', primary: true },
    log_index: { type: 'integer', primary: true },
    block_number: { type: 'text' },
    from_address: { type: 'text', nullable: true },
    to_address: { type: 'text', nullable: true },
    amount: { type: 'text' },
    block_timestamp: { type: 'text', nullable: true },
  },
  indices: [
    {
      name: 'idx_transfers_from_order',
      columns: ['token_chain', 'from_address', 'block_number', 'log_index'],
    },
    {
      name: 'idx_transfers_to_order',
      columns: ['token_chain', 'to_address', 'block_number', 'log_index'],
    },
  ],
});

export interface TokenTransferSyncStateEntity {
  token_chain: string;
  last_synced_block: string;
  last_transaction_hash: string | null;
  last_log_index: number | null;
  updated_at: string;
}

export const TokenTransferSyncStateSchema = new EntitySchema<TokenTransferSyncStateEntity>({
  name: 'token_transfer_sync_state',
  tableName: 'token_transfer_sync_state',
  columns: {
    token_chain: { type: 'text', primary: true },
    last_synced_block: { type: 'text' },
    last_transaction_hash: { type: 'text', nullable: true },
    last_log_index: { type: 'integer', nullable: true },
    updated_at: { type: 'text' },
  },
});
