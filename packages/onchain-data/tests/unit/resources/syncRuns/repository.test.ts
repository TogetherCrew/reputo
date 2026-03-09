import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSyncRunsRepo } from '../../../../src/resources/syncRuns/repository.js';
import type { SyncRun } from '../../../../src/resources/syncRuns/types.js';
import type { OnchainDataDb } from '../../../../src/shared/types/db.js';
import { cleanupTestDb, createTestDb } from '../../../utils/db-helpers.js';

function createMockSyncRun(overrides?: Partial<Omit<SyncRun, 'id'>>): Omit<SyncRun, 'id'> {
  return {
    chainId: '1',
    tokenAddress: '0xtoken',
    requestedFromBlock: 1000,
    requestedToBlock: Number.MAX_SAFE_INTEGER,
    effectiveToBlock: null,
    status: 'started',
    errorSummary: null,
    startedAt: '2024-01-01T00:00:00.000Z',
    completedAt: null,
    ...overrides,
  };
}

describe('SyncRuns Repository', () => {
  let db: OnchainDataDb;
  let repo: ReturnType<typeof createSyncRunsRepo>;

  beforeEach(() => {
    db = createTestDb();
    repo = createSyncRunsRepo(db);
  });

  afterEach(() => {
    cleanupTestDb(db);
  });

  describe('create', () => {
    it('should insert a sync run and return its id', () => {
      const id = repo.create(createMockSyncRun());
      expect(id).toBeGreaterThan(0);
    });

    it('should auto-increment ids', () => {
      const id1 = repo.create(createMockSyncRun());
      const id2 = repo.create(createMockSyncRun());
      expect(id2).toBe(id1 + 1);
    });
  });

  describe('updateStatus', () => {
    it('should update status and completedAt', () => {
      const id = repo.create(createMockSyncRun());

      repo.updateStatus(id, {
        status: 'succeeded',
        effectiveToBlock: 5000,
        completedAt: '2024-01-01T01:00:00.000Z',
      });

      const run = repo.findById(id);
      expect(run?.status).toBe('succeeded');
      expect(run?.effectiveToBlock).toBe(5000);
      expect(run?.completedAt).toBe('2024-01-01T01:00:00.000Z');
    });

    it('should update status to failed with error summary', () => {
      const id = repo.create(createMockSyncRun());

      repo.updateStatus(id, {
        status: 'failed',
        errorSummary: 'provider timeout',
        completedAt: '2024-01-01T01:00:00.000Z',
      });

      const run = repo.findById(id);
      expect(run?.status).toBe('failed');
      expect(run?.errorSummary).toBe('provider timeout');
    });

    it('should update status to noop', () => {
      const id = repo.create(createMockSyncRun());

      repo.updateStatus(id, {
        status: 'noop',
        effectiveToBlock: 999,
        completedAt: '2024-01-01T01:00:00.000Z',
      });

      const run = repo.findById(id);
      expect(run?.status).toBe('noop');
      expect(run?.effectiveToBlock).toBe(999);
    });
  });

  describe('findById', () => {
    it('should return the sync run by id', () => {
      const id = repo.create(createMockSyncRun({ chainId: '1', tokenAddress: '0xabc' }));

      const run = repo.findById(id);
      expect(run).toBeDefined();
      expect(run?.chainId).toBe('1');
      expect(run?.tokenAddress).toBe('0xabc');
    });

    it('should return undefined for non-existent id', () => {
      expect(repo.findById(999)).toBeUndefined();
    });
  });

  describe('findByTarget', () => {
    it('should return runs for a specific target ordered by id desc', () => {
      repo.create(createMockSyncRun({ chainId: '1', tokenAddress: '0xabc' }));
      repo.create(createMockSyncRun({ chainId: '1', tokenAddress: '0xabc' }));
      repo.create(createMockSyncRun({ chainId: '1', tokenAddress: '0xother' }));

      const runs = repo.findByTarget('1', '0xabc');
      expect(runs).toHaveLength(2);
      expect(runs[0].id).toBeGreaterThan(runs[1].id as number);
    });

    it('should return empty array for unknown target', () => {
      expect(repo.findByTarget('999', '0xnope')).toHaveLength(0);
    });
  });
});
