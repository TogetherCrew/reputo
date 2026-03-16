import type { DataSource, Repository } from 'typeorm';
import { type AssetKey, type AssetTransferSyncState, normalizeHexBlock, OnchainAssets } from '../../shared/index.js';
import { type AssetTransferSyncStateEntity, AssetTransferSyncStateSchema } from '../schema.js';

export interface AssetTransferSyncStateRepository {
  findByAssetKey(assetKey: AssetKey): Promise<AssetTransferSyncState | null>;
  upsert(input: AssetTransferSyncState): Promise<void>;
}

export function createAssetTransferSyncStateRepository(dataSource: DataSource): AssetTransferSyncStateRepository {
  const repo: Repository<AssetTransferSyncStateEntity> = dataSource.getRepository(AssetTransferSyncStateSchema);

  return {
    async findByAssetKey(assetKey: AssetKey): Promise<AssetTransferSyncState | null> {
      const asset = OnchainAssets[assetKey];
      const row = await repo.findOneBy({
        chain: asset.chain,
        asset_identifier: asset.assetIdentifier,
      });
      if (!row) return null;
      return {
        chain: row.chain,
        assetIdentifier: row.asset_identifier,
        lastSyncedBlock: normalizeHexBlock(row.last_synced_block),
        ...(row.last_transaction_hash != null && {
          lastTransactionHash: row.last_transaction_hash,
        }),
        ...(row.last_log_index != null && {
          lastLogIndex: row.last_log_index,
        }),
        updatedAt: row.updated_at,
      };
    },

    async upsert(input: AssetTransferSyncState): Promise<void> {
      await repo
        .createQueryBuilder()
        .insert()
        .into(AssetTransferSyncStateSchema)
        .values({
          chain: input.chain,
          asset_identifier: input.assetIdentifier,
          last_synced_block: normalizeHexBlock(input.lastSyncedBlock),
          last_transaction_hash: input.lastTransactionHash ?? null,
          last_log_index: input.lastLogIndex ?? null,
          updated_at: input.updatedAt,
        })
        .orUpdate(
          ['last_synced_block', 'last_transaction_hash', 'last_log_index', 'updated_at'],
          ['chain', 'asset_identifier'],
        )
        .execute();
    },
  };
}
