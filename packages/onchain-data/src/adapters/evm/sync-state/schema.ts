import { EntitySchema } from 'typeorm';

export const EVM_ASSET_TRANSFER_SYNC_STATE_TABLE = 'evm_asset_transfer_sync_state';

export interface EvmAssetTransferSyncStateRow {
  chain: string;
  asset_identifier: string;
  last_synced_block: string;
  updated_at: Date;
}

export const EvmAssetTransferSyncStateEntitySchema = new EntitySchema<EvmAssetTransferSyncStateRow>({
  name: 'evm_asset_transfer_sync_state',
  tableName: EVM_ASSET_TRANSFER_SYNC_STATE_TABLE,
  columns: {
    chain: {
      type: 'text',
      primary: true,
    },
    asset_identifier: {
      type: 'text',
      primary: true,
    },
    last_synced_block: {
      type: 'text',
    },
    updated_at: {
      type: 'timestamptz',
    },
  },
});
