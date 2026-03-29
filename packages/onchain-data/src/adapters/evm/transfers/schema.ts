import { EntitySchema } from 'typeorm';

import type { EvmTransferTarget, RawEvmAssetTransfer } from './types.js';

export const EVM_ASSET_TRANSFERS_TABLE = 'evm_asset_transfers';

export interface EvmAssetTransferRow {
  chain: string;
  asset_identifier: string;
  block_num: string;
  unique_id: string;
  hash: string;
  from_address: string;
  to_address: string | null;
  value: number | null;
  asset: string | null;
  category: string;
  raw_contract: RawEvmAssetTransfer['rawContract'];
  metadata: RawEvmAssetTransfer['metadata'] | null;
  raw_json: RawEvmAssetTransfer;
}

export const EvmAssetTransferEntitySchema = new EntitySchema<EvmAssetTransferRow>({
  name: 'evm_asset_transfer',
  tableName: EVM_ASSET_TRANSFERS_TABLE,
  columns: {
    chain: {
      type: 'text',
      primary: true,
    },
    asset_identifier: {
      type: 'text',
      primary: true,
    },
    block_num: {
      type: 'text',
    },
    unique_id: {
      type: 'text',
      primary: true,
    },
    hash: {
      type: 'text',
    },
    from_address: {
      type: 'text',
    },
    to_address: {
      type: 'text',
      nullable: true,
    },
    value: {
      type: 'jsonb',
      nullable: true,
    },
    asset: {
      type: 'text',
      nullable: true,
    },
    category: {
      type: 'text',
    },
    raw_contract: {
      type: 'jsonb',
    },
    metadata: {
      type: 'jsonb',
      nullable: true,
    },
    raw_json: {
      type: 'jsonb',
    },
  },
});

export function toEvmAssetTransferRow(target: EvmTransferTarget, transfer: RawEvmAssetTransfer): EvmAssetTransferRow {
  return {
    chain: target.chain,
    asset_identifier: target.assetIdentifier,
    block_num: transfer.blockNum,
    unique_id: transfer.uniqueId,
    hash: transfer.hash,
    from_address: transfer.from,
    to_address: transfer.to,
    value: transfer.value,
    asset: transfer.asset,
    category: transfer.category,
    raw_contract: transfer.rawContract,
    metadata: transfer.metadata ?? null,
    raw_json: transfer,
  };
}
