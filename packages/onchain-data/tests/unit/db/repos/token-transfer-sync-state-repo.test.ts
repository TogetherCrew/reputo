import type { DataSource } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { TokenTransferSyncStateRepository } from '../../../../src/db/repos/token-transfer-sync-state-repo.js';
import { createTokenTransferSyncStateRepository } from '../../../../src/db/repos/token-transfer-sync-state-repo.js';
import { SupportedTokenChain } from '../../../../src/shared/index.js';
import { closeTestDataSource, createTestDataSource } from '../../../utils/db-helpers.js';

describe('TokenTransferSyncStateRepository', () => {
  let ds: DataSource;
  let repo: TokenTransferSyncStateRepository;

  beforeEach(async () => {
    ds = await createTestDataSource();
    repo = createTokenTransferSyncStateRepository(ds);
  });

  afterEach(async () => {
    await closeTestDataSource(ds);
  });

  describe('findByTokenChain', () => {
    it('returns null when no sync state exists', async () => {
      const result = await repo.findByTokenChain(SupportedTokenChain.FET_ETHEREUM);
      expect(result).toBeNull();
    });

    it('returns sync state after upsert', async () => {
      await repo.upsert({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        lastSyncedBlock: '0x3e8',
        updatedAt: '2024-01-15T10:00:00.000Z',
      });

      const result = await repo.findByTokenChain(SupportedTokenChain.FET_ETHEREUM);
      expect(result).toEqual({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        lastSyncedBlock: '0x3e8',
        updatedAt: '2024-01-15T10:00:00.000Z',
      });
    });
  });

  describe('upsert', () => {
    it('creates new sync state', async () => {
      await repo.upsert({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        lastSyncedBlock: '0x1388',
        updatedAt: '2024-01-15T10:00:00.000Z',
      });

      const result = await repo.findByTokenChain(SupportedTokenChain.FET_ETHEREUM);
      expect(result?.lastSyncedBlock).toBe('0x1388');
    });

    it('updates existing sync state', async () => {
      await repo.upsert({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        lastSyncedBlock: '0x1388',
        updatedAt: '2024-01-15T10:00:00.000Z',
      });

      await repo.upsert({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        lastSyncedBlock: '0x2710',
        updatedAt: '2024-01-15T11:00:00.000Z',
      });

      const result = await repo.findByTokenChain(SupportedTokenChain.FET_ETHEREUM);
      expect(result?.lastSyncedBlock).toBe('0x2710');
      expect(result?.updatedAt).toBe('2024-01-15T11:00:00.000Z');
    });

    it('stores and returns last_transaction_hash and last_log_index', async () => {
      await repo.upsert({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        lastSyncedBlock: '0x1388',
        lastTransactionHash: '0xabc123',
        lastLogIndex: 5,
        updatedAt: '2024-01-15T10:00:00.000Z',
      });

      const result = await repo.findByTokenChain(SupportedTokenChain.FET_ETHEREUM);
      expect(result?.lastTransactionHash).toBe('0xabc123');
      expect(result?.lastLogIndex).toBe(5);
    });
  });
});
