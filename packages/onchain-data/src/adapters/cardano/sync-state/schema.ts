import { EntitySchema } from 'typeorm';

import type { RawCardanoAssetTransaction } from '../provider/types.js';

export const CARDANO_ASSET_TRANSACTION_SYNC_STATE_TABLE = 'cardano_asset_transaction_sync_state';

export interface CardanoAssetTransactionSyncStateRow {
  chain: string;
  asset_identifier: string;
  last_tx_hash: string;
  last_tx_index: number;
  last_block_height: number;
  last_block_time: number;
  last_asset_transaction_raw_json: RawCardanoAssetTransaction;
  updated_at: Date;
}

export const CardanoAssetTransactionSyncStateEntitySchema = new EntitySchema<CardanoAssetTransactionSyncStateRow>({
  name: 'cardano_asset_transaction_sync_state',
  tableName: CARDANO_ASSET_TRANSACTION_SYNC_STATE_TABLE,
  columns: {
    chain: {
      type: 'text',
      primary: true,
    },
    asset_identifier: {
      type: 'text',
      primary: true,
    },
    last_tx_hash: {
      type: 'text',
    },
    last_tx_index: {
      type: 'integer',
    },
    last_block_height: {
      type: 'integer',
    },
    last_block_time: {
      type: 'integer',
    },
    last_asset_transaction_raw_json: {
      type: 'jsonb',
    },
    updated_at: {
      type: 'timestamptz',
    },
  },
});
