import { EntitySchema } from 'typeorm';
import type { AssetKey } from '../shared/constants/assets.js';

export interface AssetTransferEntity {
  asset_key: AssetKey;
  block_number: number;
  transaction_hash: string;
  log_index: number;
  from_address: string | null;
  to_address: string | null;
  amount: string;
  block_timestamp_unix: number | null;
}

export const AssetTransferSchema = new EntitySchema<AssetTransferEntity>({
  name: 'asset_transfer',
  tableName: 'asset_transfers',
  indices: [
    {
      name: 'idx_asset_transfers_asset_from_timestamp_order',
      columns: ['asset_key', 'from_address', 'block_timestamp_unix', 'block_number', 'log_index', 'transaction_hash'],
      where: 'from_address IS NOT NULL',
    },
    {
      name: 'idx_asset_transfers_asset_to_timestamp_order',
      columns: ['asset_key', 'to_address', 'block_timestamp_unix', 'block_number', 'log_index', 'transaction_hash'],
      where: 'to_address IS NOT NULL',
    },
  ],
  columns: {
    asset_key: { type: 'text', primary: true },
    transaction_hash: { type: 'text', primary: true },
    log_index: { type: 'integer', primary: true },
    block_number: { type: 'bigint' },
    from_address: { type: 'text', nullable: true },
    to_address: { type: 'text', nullable: true },
    amount: { type: 'text' },
    block_timestamp_unix: { type: 'bigint', nullable: true },
  },
});

export interface AssetTransferSyncStateEntity {
  chain: string;
  asset_identifier: string;
  last_synced_block: number;
  last_transaction_hash: string | null;
  last_log_index: number | null;
  updated_at_unix: number;
}

export const AssetTransferSyncStateSchema = new EntitySchema<AssetTransferSyncStateEntity>({
  name: 'asset_transfer_sync_state',
  tableName: 'asset_transfer_sync_state',
  columns: {
    chain: { type: 'text', primary: true },
    asset_identifier: { type: 'text', primary: true },
    last_synced_block: { type: 'bigint' },
    last_transaction_hash: { type: 'text', nullable: true },
    last_log_index: { type: 'integer', nullable: true },
    updated_at_unix: { type: 'bigint' },
  },
});
