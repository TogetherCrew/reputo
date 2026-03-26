import { EntitySchema } from 'typeorm';
import type { RawCardanoAssetTransaction } from '../provider/types.js';
import type { CardanoTransferTarget } from '../transfers/types.js';

export const CARDANO_ASSET_TRANSACTIONS_TABLE = 'cardano_asset_transactions';

export interface CardanoAssetTransactionRow {
  chain: string;
  asset_identifier: string;
  tx_hash: string;
  tx_index: number;
  block_height: number;
  block_time: number;
  raw_json: RawCardanoAssetTransaction;
}

export const CardanoAssetTransactionEntitySchema = new EntitySchema<CardanoAssetTransactionRow>({
  name: 'cardano_asset_transaction',
  tableName: CARDANO_ASSET_TRANSACTIONS_TABLE,
  columns: {
    chain: {
      type: 'text',
      primary: true,
    },
    asset_identifier: {
      type: 'text',
      primary: true,
    },
    tx_hash: {
      type: 'text',
      primary: true,
    },
    tx_index: {
      type: 'integer',
    },
    block_height: {
      type: 'integer',
    },
    block_time: {
      type: 'integer',
    },
    raw_json: {
      type: 'jsonb',
    },
  },
});

export function toCardanoAssetTransactionRow(
  target: CardanoTransferTarget,
  assetTransaction: RawCardanoAssetTransaction,
): CardanoAssetTransactionRow {
  return {
    chain: target.chain,
    asset_identifier: target.assetIdentifier,
    tx_hash: assetTransaction.tx_hash,
    tx_index: assetTransaction.tx_index,
    block_height: assetTransaction.block_height,
    block_time: assetTransaction.block_time,
    raw_json: assetTransaction,
  };
}
