import type BetterSqlite3 from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { TokenTransferSyncStateRepository } from '../../../../src/db/repos/token-transfer-sync-state-repo.js';
import { createTokenTransferSyncStateRepository } from '../../../../src/db/repos/token-transfer-sync-state-repo.js';
import { SupportedTokenChain } from '../../../../src/shared/index.js';
import { closeTestDatabase, createTestDatabase } from '../../../utils/db-helpers.js';

describe('TokenTransferSyncStateRepository', () => {
  let db: BetterSqlite3.Database;
  let repo: TokenTransferSyncStateRepository;

  beforeEach(() => {
    db = createTestDatabase();
    repo = createTokenTransferSyncStateRepository(db);
  });

  afterEach(() => {
    closeTestDatabase(db);
  });

  describe('findByTokenChain', () => {
    it('returns null when no sync state exists', () => {
      const result = repo.findByTokenChain(SupportedTokenChain.FET_ETHEREUM);
      expect(result).toBeNull();
    });

    it('returns sync state after upsert', () => {
      repo.upsert({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        lastSyncedBlock: '0x3e8',
        updatedAt: '2024-01-15T10:00:00.000Z',
      });

      const result = repo.findByTokenChain(SupportedTokenChain.FET_ETHEREUM);
      expect(result).toEqual({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        lastSyncedBlock: '0x3e8',
        updatedAt: '2024-01-15T10:00:00.000Z',
      });
    });
  });

  describe('upsert', () => {
    it('creates new sync state', () => {
      repo.upsert({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        lastSyncedBlock: '0x1388',
        updatedAt: '2024-01-15T10:00:00.000Z',
      });

      const result = repo.findByTokenChain(SupportedTokenChain.FET_ETHEREUM);
      expect(result?.lastSyncedBlock).toBe('0x1388');
    });

    it('updates existing sync state', () => {
      repo.upsert({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        lastSyncedBlock: '0x1388',
        updatedAt: '2024-01-15T10:00:00.000Z',
      });

      repo.upsert({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        lastSyncedBlock: '0x2710',
        updatedAt: '2024-01-15T11:00:00.000Z',
      });

      const result = repo.findByTokenChain(SupportedTokenChain.FET_ETHEREUM);
      expect(result?.lastSyncedBlock).toBe('0x2710');
      expect(result?.updatedAt).toBe('2024-01-15T11:00:00.000Z');
    });

    it('stores and returns last_transaction_hash and last_log_index', () => {
      repo.upsert({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        lastSyncedBlock: '0x1388',
        lastTransactionHash: '0xabc123',
        lastLogIndex: 5,
        updatedAt: '2024-01-15T10:00:00.000Z',
      });

      const result = repo.findByTokenChain(SupportedTokenChain.FET_ETHEREUM);
      expect(result?.lastTransactionHash).toBe('0xabc123');
      expect(result?.lastLogIndex).toBe(5);
    });
  });
});
