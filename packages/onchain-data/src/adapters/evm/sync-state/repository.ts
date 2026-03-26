import type { EntityManager } from 'typeorm';

import type { EvmTransferTarget } from '../transfers/types.js';
import { EvmAssetTransferSyncStateEntitySchema, type EvmAssetTransferSyncStateRow } from './schema.js';

export async function findEvmAssetTransferSyncState(
  manager: EntityManager,
  target: EvmTransferTarget,
): Promise<EvmAssetTransferSyncStateRow | null> {
  return manager.getRepository(EvmAssetTransferSyncStateEntitySchema).findOneBy({
    chain: target.chain,
    asset_identifier: target.assetIdentifier,
  });
}

export async function upsertEvmAssetTransferSyncState(
  manager: EntityManager,
  input: {
    chain: string;
    assetIdentifier: string;
    lastSyncedBlock: string;
    updatedAt: Date;
  },
): Promise<void> {
  await manager.getRepository(EvmAssetTransferSyncStateEntitySchema).upsert(
    {
      chain: input.chain,
      asset_identifier: input.assetIdentifier,
      last_synced_block: input.lastSyncedBlock,
      updated_at: input.updatedAt,
    },
    ['chain', 'asset_identifier'],
  );
}
