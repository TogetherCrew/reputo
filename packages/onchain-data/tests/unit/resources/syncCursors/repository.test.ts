import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSyncCursorsRepo } from '../../../../src/resources/syncCursors/repository.js';
import type { OnchainDataDb } from '../../../../src/shared/types/db.js';
import { cleanupTestDb, createTestDb } from '../../../utils/db-helpers.js';
import { createMockSyncCursor } from '../../../utils/mock-helpers.js';

describe('SyncCursors Repository', () => {
  let db: OnchainDataDb;
  let repo: ReturnType<typeof createSyncCursorsRepo>;

  beforeEach(() => {
    db = createTestDb();
    repo = createSyncCursorsRepo(db);
  });

  afterEach(() => {
    cleanupTestDb(db);
  });

  describe('upsert', () => {
    it('should insert a new cursor', () => {
      repo.upsert(createMockSyncCursor({ chainId: '1', tokenAddress: '0xtoken', cursorBlock: 18_000_000 }));

      const result = repo.findByChainAndToken('1', '0xtoken');
      expect(result).toBeDefined();
      expect(result?.cursorBlock).toBe(18_000_000);
    });

    it('should update cursor_block on conflict', () => {
      repo.upsert(createMockSyncCursor({ cursorBlock: 100 }));
      repo.upsert(createMockSyncCursor({ cursorBlock: 200 }));

      const all = repo.findAll();
      expect(all).toHaveLength(1);
      expect(all[0].cursorBlock).toBe(200);
    });

    it('should update updated_at on conflict', () => {
      repo.upsert(createMockSyncCursor({ updatedAt: '2024-01-01T00:00:00Z' }));
      repo.upsert(createMockSyncCursor({ updatedAt: '2024-06-15T12:00:00Z' }));

      const result = repo.findByChainAndToken('1', '0xtoken');
      expect(result?.updatedAt).toBe('2024-06-15T12:00:00Z');
    });

    it('should keep separate cursors for different tokens on the same chain', () => {
      repo.upsert(createMockSyncCursor({ tokenAddress: '0xtokenA', cursorBlock: 100 }));
      repo.upsert(createMockSyncCursor({ tokenAddress: '0xtokenB', cursorBlock: 200 }));

      expect(repo.findAll()).toHaveLength(2);
      expect(repo.findByChainAndToken('1', '0xtokenA')?.cursorBlock).toBe(100);
      expect(repo.findByChainAndToken('1', '0xtokenB')?.cursorBlock).toBe(200);
    });

    it('should keep separate cursors for the same token on different chains', () => {
      repo.upsert(createMockSyncCursor({ chainId: '1', cursorBlock: 100 }));
      repo.upsert(createMockSyncCursor({ chainId: '137', cursorBlock: 50 }));

      expect(repo.findAll()).toHaveLength(2);
      expect(repo.findByChainAndToken('1', '0xtoken')?.cursorBlock).toBe(100);
      expect(repo.findByChainAndToken('137', '0xtoken')?.cursorBlock).toBe(50);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no cursors exist', () => {
      expect(repo.findAll()).toHaveLength(0);
    });

    it('should return all cursors', () => {
      repo.upsert(createMockSyncCursor({ chainId: '1', tokenAddress: '0xtokenA' }));
      repo.upsert(createMockSyncCursor({ chainId: '1', tokenAddress: '0xtokenB' }));
      repo.upsert(createMockSyncCursor({ chainId: '137', tokenAddress: '0xtokenA' }));

      expect(repo.findAll()).toHaveLength(3);
    });
  });

  describe('findByChainAndToken', () => {
    it('should find cursor by composite key', () => {
      repo.upsert(createMockSyncCursor({ chainId: '1', tokenAddress: '0xtokenA', cursorBlock: 100 }));
      repo.upsert(createMockSyncCursor({ chainId: '1', tokenAddress: '0xtokenB', cursorBlock: 200 }));

      const result = repo.findByChainAndToken('1', '0xtokenA');
      expect(result).toBeDefined();
      expect(result?.cursorBlock).toBe(100);
    });

    it('should return undefined for non-existent cursor', () => {
      const result = repo.findByChainAndToken('1', '0xnope');
      expect(result).toBeUndefined();
    });

    it('should not match when only chain matches', () => {
      repo.upsert(createMockSyncCursor({ chainId: '1', tokenAddress: '0xtokenA' }));

      expect(repo.findByChainAndToken('1', '0xtokenB')).toBeUndefined();
    });

    it('should not match when only token matches', () => {
      repo.upsert(createMockSyncCursor({ chainId: '1', tokenAddress: '0xtokenA' }));

      expect(repo.findByChainAndToken('137', '0xtokenA')).toBeUndefined();
    });
  });

  describe('findByChain', () => {
    beforeEach(() => {
      repo.upsert(createMockSyncCursor({ chainId: '1', tokenAddress: '0xtokenA' }));
      repo.upsert(createMockSyncCursor({ chainId: '1', tokenAddress: '0xtokenB' }));
      repo.upsert(createMockSyncCursor({ chainId: '137', tokenAddress: '0xtokenA' }));
    });

    it('should return all cursors for the given chain', () => {
      const result = repo.findByChain('1');
      expect(result).toHaveLength(2);
    });

    it('should not include cursors from other chains', () => {
      const result = repo.findByChain('137');
      expect(result).toHaveLength(1);
      expect(result[0].chainId).toBe('137');
    });

    it('should return empty array for unknown chain', () => {
      expect(repo.findByChain('42161')).toHaveLength(0);
    });
  });
});
