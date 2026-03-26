import type { EntityManager } from 'typeorm';

import type { RawCardanoAssetTransaction } from '../provider/types.js';
import type { CardanoTransferTarget } from '../transfers/types.js';
import { CardanoAssetTransactionSyncStateEntitySchema, type CardanoAssetTransactionSyncStateRow } from './schema.js';

export async function findCardanoAssetTransactionSyncState(
  manager: EntityManager,
  target: CardanoTransferTarget,
): Promise<CardanoAssetTransactionSyncStateRow | null> {
  return manager.getRepository(CardanoAssetTransactionSyncStateEntitySchema).findOneBy({
    chain: target.chain,
    asset_identifier: target.assetIdentifier,
  });
}

export async function upsertCardanoAssetTransactionSyncState(
  manager: EntityManager,
  input: {
    chain: string;
    assetIdentifier: string;
    lastAssetTransaction: RawCardanoAssetTransaction;
    updatedAt: Date;
  },
): Promise<void> {
  await manager.getRepository(CardanoAssetTransactionSyncStateEntitySchema).upsert(
    {
      chain: input.chain,
      asset_identifier: input.assetIdentifier,
      last_tx_hash: input.lastAssetTransaction.tx_hash,
      last_tx_index: input.lastAssetTransaction.tx_index,
      last_block_height: input.lastAssetTransaction.block_height,
      last_block_time: input.lastAssetTransaction.block_time,
      last_asset_transaction_raw_json: input.lastAssetTransaction,
      updated_at: input.updatedAt,
    },
    ['chain', 'asset_identifier'],
  );
}
