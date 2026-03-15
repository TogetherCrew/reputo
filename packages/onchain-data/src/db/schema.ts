import { EntitySchema } from 'typeorm';

export interface AssetTransferEntity {
  chain: string;
  asset_identifier: string;
  block_number: string;
  transaction_hash: string;
  log_index: number;
  from_address: string | null;
  to_address: string | null;
  amount: string;
  block_timestamp: string | null;
}

export const AssetTransferSchema = new EntitySchema<AssetTransferEntity>({
  name: 'asset_transfer',
  tableName: 'asset_transfers',
  columns: {
    chain: { type: 'text', primary: true },
    asset_identifier: { type: 'text', primary: true },
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
      name: 'idx_asset_transfers_from_order',
      columns: ['chain', 'asset_identifier', 'from_address', 'block_number', 'log_index'],
    },
    {
      name: 'idx_asset_transfers_to_order',
      columns: ['chain', 'asset_identifier', 'to_address', 'block_number', 'log_index'],
    },
  ],
});

export interface AssetTransferSyncStateEntity {
  chain: string;
  asset_identifier: string;
  last_synced_block: string;
  last_transaction_hash: string | null;
  last_log_index: number | null;
  updated_at: string;
}

export const AssetTransferSyncStateSchema = new EntitySchema<AssetTransferSyncStateEntity>({
  name: 'asset_transfer_sync_state',
  tableName: 'asset_transfer_sync_state',
  columns: {
    chain: { type: 'text', primary: true },
    asset_identifier: { type: 'text', primary: true },
    last_synced_block: { type: 'text' },
    last_transaction_hash: { type: 'text', nullable: true },
    last_log_index: { type: 'integer', nullable: true },
    updated_at: { type: 'text' },
  },
});
