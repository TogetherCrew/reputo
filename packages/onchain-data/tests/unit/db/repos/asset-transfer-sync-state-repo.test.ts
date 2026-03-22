import type { DataSource } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AssetTransferSyncStateRepository } from '../../../../src/db/repos/asset-transfer-sync-state-repo.js';
import { createAssetTransferSyncStateRepository } from '../../../../src/db/repos/asset-transfer-sync-state-repo.js';
import { type AssetKey, OnchainAssets } from '../../../../src/shared/index.js';
import { closeTestDataSource, createTestDataSource, hasContainerRuntime } from '../../../utils/db-helpers.js';

const FET_ETHEREUM: AssetKey = 'fet_ethereum';
const asset = OnchainAssets.fet_ethereum;

const describePostgres = hasContainerRuntime ? describe : describe.skip;

describePostgres('AssetTransferSyncStateRepository', () => {
  let ds: DataSource;
  let repo: AssetTransferSyncStateRepository;

  beforeEach(async () => {
    ds = await createTestDataSource();
    repo = createAssetTransferSyncStateRepository(ds);
  });

  afterEach(async () => {
    await closeTestDataSource(ds);
  });

  describe('findByAssetKey', () => {
    it('returns null when no sync state exists', async () => {
      const result = await repo.findByAssetKey(FET_ETHEREUM);
      expect(result).toBeNull();
    });

    it('returns sync state after upsert', async () => {
      await repo.upsert({
        chain: asset.chain,
        assetIdentifier: asset.assetIdentifier,
        lastSyncedBlock: '0x3e8',
        updatedAt: '2024-01-15T10:00:00.000Z',
      });

      const result = await repo.findByAssetKey(FET_ETHEREUM);
      expect(result).toEqual({
        chain: asset.chain,
        assetIdentifier: asset.assetIdentifier,
        lastSyncedBlock: '0x3e8',
        updatedAt: '2024-01-15T10:00:00.000Z',
      });
    });
  });

  describe('upsert', () => {
    it('creates new sync state', async () => {
      await repo.upsert({
        chain: asset.chain,
        assetIdentifier: asset.assetIdentifier,
        lastSyncedBlock: '0x1388',
        updatedAt: '2024-01-15T10:00:00.000Z',
      });

      const result = await repo.findByAssetKey(FET_ETHEREUM);
      expect(result?.lastSyncedBlock).toBe('0x1388');
    });

    it('updates existing sync state', async () => {
      await repo.upsert({
        chain: asset.chain,
        assetIdentifier: asset.assetIdentifier,
        lastSyncedBlock: '0x1388',
        updatedAt: '2024-01-15T10:00:00.000Z',
      });

      await repo.upsert({
        chain: asset.chain,
        assetIdentifier: asset.assetIdentifier,
        lastSyncedBlock: '0x2710',
        updatedAt: '2024-01-15T11:00:00.000Z',
      });

      const result = await repo.findByAssetKey(FET_ETHEREUM);
      expect(result?.lastSyncedBlock).toBe('0x2710');
      expect(result?.updatedAt).toBe('2024-01-15T11:00:00.000Z');
    });

    it('stores and returns last_transaction_hash and last_log_index', async () => {
      await repo.upsert({
        chain: asset.chain,
        assetIdentifier: asset.assetIdentifier,
        lastSyncedBlock: '0x1388',
        lastTransactionHash: '0xabc123',
        lastLogIndex: 5,
        updatedAt: '2024-01-15T10:00:00.000Z',
      });

      const result = await repo.findByAssetKey(FET_ETHEREUM);
      expect(result?.lastTransactionHash).toBe('0xabc123');
      expect(result?.lastLogIndex).toBe(5);
    });
  });
});
