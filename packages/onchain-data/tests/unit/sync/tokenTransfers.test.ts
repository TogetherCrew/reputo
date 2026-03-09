import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSyncCursorsRepo } from '../../../src/resources/syncCursors/repository.js';
import { createSyncRunsRepo } from '../../../src/resources/syncRuns/repository.js';
import { createTransfersRepo } from '../../../src/resources/transfers/repository.js';
import type { OnchainDataDb } from '../../../src/shared/types/db.js';
import { createSyncService } from '../../../src/sync/tokenTransfers.js';
import type { TransferProvider } from '../../../src/sync/types.js';
import { cleanupTestDb, createTestDb } from '../../utils/db-helpers.js';
import { createMockTransfer } from '../../utils/mock-helpers.js';

function createMockProvider(overrides?: Partial<TransferProvider>): TransferProvider {
  return {
    fetchErc20Transfers: vi.fn().mockResolvedValue({ transfers: [], effectiveToBlock: 0 }),
    ...overrides,
  };
}

describe('syncTokenTransfers', () => {
  let db: OnchainDataDb;
  let provider: TransferProvider;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    cleanupTestDb(db);
  });

  describe('first sync (no existing cursor)', () => {
    it('should start from initialStartBlock when no cursor exists', async () => {
      provider = createMockProvider({
        fetchErc20Transfers: vi.fn().mockResolvedValue({
          transfers: [
            createMockTransfer({
              chain_id: '1',
              token_address: '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85',
              block_number: 1000,
              transaction_hash: '0xtx1',
              log_index: 0,
            }),
          ],
          effectiveToBlock: 2000,
        }),
      });

      const service = createSyncService({ provider, db });
      const result = await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xaeA46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
        initialStartBlock: 1000,
      });

      expect(result.status).toBe('succeeded');
      expect(result.requestedFromBlock).toBe(1000);
      expect(result.effectiveToBlock).toBe(2000);
      expect(result.transferCount).toBe(1);

      expect(provider.fetchErc20Transfers).toHaveBeenCalledWith(
        expect.objectContaining({
          chain: 'ethereum',
          tokenContractAddress: '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85',
          fromBlock: 1000,
        }),
      );
    });

    it('should create sync target cursor after successful first sync', async () => {
      provider = createMockProvider({
        fetchErc20Transfers: vi.fn().mockResolvedValue({ transfers: [], effectiveToBlock: 5000 }),
      });

      const service = createSyncService({ provider, db });
      await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xToken',
        initialStartBlock: 1000,
      });

      const cursor = createSyncCursorsRepo(db).findByChainAndToken('1', '0xtoken');
      expect(cursor).toBeDefined();
      expect(cursor?.cursorBlock).toBe(5000);
    });
  });

  describe('subsequent sync (cursor exists)', () => {
    it('should start from cursor + 1 when a cursor exists', async () => {
      const cursorsRepo = createSyncCursorsRepo(db);
      cursorsRepo.upsert({
        chainId: '1',
        tokenAddress: '0xtoken',
        cursorBlock: 3000,
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      provider = createMockProvider({
        fetchErc20Transfers: vi.fn().mockResolvedValue({ transfers: [], effectiveToBlock: 5000 }),
      });

      const service = createSyncService({ provider, db });
      const result = await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xToken',
        initialStartBlock: 0,
      });

      expect(result.status).toBe('succeeded');
      expect(result.requestedFromBlock).toBe(3001);

      expect(provider.fetchErc20Transfers).toHaveBeenCalledWith(expect.objectContaining({ fromBlock: 3001 }));
    });

    it('should advance cursor to effectiveToBlock', async () => {
      const cursorsRepo = createSyncCursorsRepo(db);
      cursorsRepo.upsert({
        chainId: '1',
        tokenAddress: '0xtoken',
        cursorBlock: 3000,
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      provider = createMockProvider({
        fetchErc20Transfers: vi.fn().mockResolvedValue({ transfers: [], effectiveToBlock: 8000 }),
      });

      const service = createSyncService({ provider, db });
      await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xToken',
        initialStartBlock: 0,
      });

      const cursor = cursorsRepo.findByChainAndToken('1', '0xtoken');
      expect(cursor?.cursorBlock).toBe(8000);
    });
  });

  describe('EVM address canonicalization', () => {
    it('should normalize token address before lookup and persistence', async () => {
      const cursorsRepo = createSyncCursorsRepo(db);
      cursorsRepo.upsert({
        chainId: '1',
        tokenAddress: '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85',
        cursorBlock: 500,
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      provider = createMockProvider({
        fetchErc20Transfers: vi.fn().mockResolvedValue({ transfers: [], effectiveToBlock: 1000 }),
      });

      const service = createSyncService({ provider, db });
      const result = await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xaeA46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
        initialStartBlock: 0,
      });

      expect(result.requestedFromBlock).toBe(501);
    });

    it('should prevent duplicate sync targets for different address casings', async () => {
      provider = createMockProvider({
        fetchErc20Transfers: vi.fn().mockResolvedValue({ transfers: [], effectiveToBlock: 1000 }),
      });

      const service = createSyncService({ provider, db });

      await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xABC',
        initialStartBlock: 0,
      });

      await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xabc',
        initialStartBlock: 0,
      });

      const cursors = createSyncCursorsRepo(db).findByChain('1');
      expect(cursors).toHaveLength(1);
    });
  });

  describe('noop behavior', () => {
    it('should record noop when requestedFromBlock > effectiveToBlock', async () => {
      const cursorsRepo = createSyncCursorsRepo(db);
      cursorsRepo.upsert({
        chainId: '1',
        tokenAddress: '0xtoken',
        cursorBlock: 10_000,
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      provider = createMockProvider({
        fetchErc20Transfers: vi.fn().mockResolvedValue({ transfers: [], effectiveToBlock: 9000 }),
      });

      const service = createSyncService({ provider, db });
      const result = await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xToken',
        initialStartBlock: 0,
      });

      expect(result.status).toBe('noop');
      expect(result.transferCount).toBe(0);
      expect(result.effectiveToBlock).toBe(9000);
    });

    it('should not advance cursor on noop', async () => {
      const cursorsRepo = createSyncCursorsRepo(db);
      cursorsRepo.upsert({
        chainId: '1',
        tokenAddress: '0xtoken',
        cursorBlock: 10_000,
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      provider = createMockProvider({
        fetchErc20Transfers: vi.fn().mockResolvedValue({ transfers: [], effectiveToBlock: 9000 }),
      });

      const service = createSyncService({ provider, db });
      await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xToken',
        initialStartBlock: 0,
      });

      const cursor = cursorsRepo.findByChainAndToken('1', '0xtoken');
      expect(cursor?.cursorBlock).toBe(10_000);
    });

    it('should create a sync run record with noop status', async () => {
      const cursorsRepo = createSyncCursorsRepo(db);
      cursorsRepo.upsert({
        chainId: '1',
        tokenAddress: '0xtoken',
        cursorBlock: 10_000,
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      provider = createMockProvider({
        fetchErc20Transfers: vi.fn().mockResolvedValue({ transfers: [], effectiveToBlock: 9000 }),
      });

      const service = createSyncService({ provider, db });
      const result = await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xToken',
        initialStartBlock: 0,
      });

      const syncRun = createSyncRunsRepo(db).findById(result.syncRunId);
      expect(syncRun?.status).toBe('noop');
      expect(syncRun?.effectiveToBlock).toBe(9000);
    });
  });

  describe('empty-range cursor advancement', () => {
    it('should advance cursor when finalized range has zero transfers', async () => {
      provider = createMockProvider({
        fetchErc20Transfers: vi.fn().mockResolvedValue({ transfers: [], effectiveToBlock: 5000 }),
      });

      const service = createSyncService({ provider, db });
      const result = await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xToken',
        initialStartBlock: 1000,
      });

      expect(result.status).toBe('succeeded');
      expect(result.transferCount).toBe(0);

      const cursor = createSyncCursorsRepo(db).findByChainAndToken('1', '0xtoken');
      expect(cursor?.cursorBlock).toBe(5000);
    });
  });

  describe('transactional persistence', () => {
    it('should persist transfers and cursor atomically', async () => {
      const mockTransfers = [
        createMockTransfer({
          chain_id: '1',
          token_address: '0xtoken',
          block_number: 1000,
          transaction_hash: '0xtx1',
          log_index: 0,
        }),
        createMockTransfer({
          chain_id: '1',
          token_address: '0xtoken',
          block_number: 1001,
          transaction_hash: '0xtx2',
          log_index: 0,
        }),
      ];

      provider = createMockProvider({
        fetchErc20Transfers: vi.fn().mockResolvedValue({
          transfers: mockTransfers,
          effectiveToBlock: 2000,
        }),
      });

      const service = createSyncService({ provider, db });
      const result = await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xToken',
        initialStartBlock: 1000,
      });

      expect(result.status).toBe('succeeded');

      const transfersRepo = createTransfersRepo(db);
      const allTransfers = transfersRepo.findAll();
      expect(allTransfers).toHaveLength(2);

      const cursor = createSyncCursorsRepo(db).findByChainAndToken('1', '0xtoken');
      expect(cursor?.cursorBlock).toBe(2000);
    });

    it('should not advance cursor when persistence fails', async () => {
      const cursorsRepo = createSyncCursorsRepo(db);
      cursorsRepo.upsert({
        chainId: '1',
        tokenAddress: '0xtoken',
        cursorBlock: 500,
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const badTransfer = createMockTransfer({
        chain_id: '1',
        token_address: '0xtoken',
        block_number: 600,
        transaction_hash: '0xtx1',
        log_index: 0,
        block_hash: null as unknown as string, // violates NOT NULL
      });

      provider = createMockProvider({
        fetchErc20Transfers: vi.fn().mockResolvedValue({
          transfers: [badTransfer],
          effectiveToBlock: 1000,
        }),
      });

      const service = createSyncService({ provider, db });
      const result = await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xToken',
        initialStartBlock: 0,
      });

      expect(result.status).toBe('failed');

      const cursor = cursorsRepo.findByChainAndToken('1', '0xtoken');
      expect(cursor?.cursorBlock).toBe(500);
    });
  });

  describe('idempotent persistence', () => {
    it('should not create duplicate transfers on retry', async () => {
      const transfers = [
        createMockTransfer({
          chain_id: '1',
          token_address: '0xtoken',
          block_number: 1000,
          transaction_hash: '0xtx1',
          log_index: 0,
        }),
      ];

      provider = createMockProvider({
        fetchErc20Transfers: vi.fn().mockResolvedValue({
          transfers,
          effectiveToBlock: 2000,
        }),
      });

      const service = createSyncService({ provider, db });

      await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xToken',
        initialStartBlock: 1000,
      });

      const cursorsRepo = createSyncCursorsRepo(db);
      cursorsRepo.upsert({
        chainId: '1',
        tokenAddress: '0xtoken',
        cursorBlock: 999,
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xToken',
        initialStartBlock: 1000,
      });

      const allTransfers = createTransfersRepo(db).findAll();
      expect(allTransfers).toHaveLength(1);
    });
  });

  describe('sync-run lifecycle', () => {
    it('should create a sync run with started status before provider call', async () => {
      let capturedRunId: number | undefined;

      provider = createMockProvider({
        fetchErc20Transfers: vi.fn().mockImplementation(async () => {
          const runs = createSyncRunsRepo(db).findByTarget('1', '0xtoken');
          const startedRun = runs.find((r) => r.status === 'started');
          capturedRunId = startedRun?.id ?? undefined;
          return { transfers: [], effectiveToBlock: 5000 };
        }),
      });

      const service = createSyncService({ provider, db });
      await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xToken',
        initialStartBlock: 1000,
      });

      expect(capturedRunId).toBeDefined();
    });

    it('should record succeeded run with effective range details', async () => {
      provider = createMockProvider({
        fetchErc20Transfers: vi.fn().mockResolvedValue({ transfers: [], effectiveToBlock: 5000 }),
      });

      const service = createSyncService({ provider, db });
      const result = await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xToken',
        initialStartBlock: 1000,
      });

      const run = createSyncRunsRepo(db).findById(result.syncRunId);
      expect(run?.status).toBe('succeeded');
      expect(run?.effectiveToBlock).toBe(5000);
      expect(run?.requestedFromBlock).toBe(1000);
      expect(run?.completedAt).toBeTruthy();
    });

    it('should record failed run with error summary', async () => {
      provider = createMockProvider({
        fetchErc20Transfers: vi.fn().mockRejectedValue(new Error('provider timeout')),
      });

      const service = createSyncService({ provider, db });
      const result = await service.syncTokenTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xToken',
        initialStartBlock: 1000,
      });

      expect(result.status).toBe('failed');
      expect(result.error).toBe('provider timeout');

      const run = createSyncRunsRepo(db).findById(result.syncRunId);
      expect(run?.status).toBe('failed');
      expect(run?.errorSummary).toBe('provider timeout');
    });
  });

  describe('unknown chain', () => {
    it('should throw for an unknown chain', async () => {
      provider = createMockProvider();
      const service = createSyncService({ provider, db });

      await expect(
        service.syncTokenTransfers({
          chain: 'solana',
          tokenContractAddress: '0xToken',
          initialStartBlock: 0,
        }),
      ).rejects.toThrow('Unknown chain: "solana"');
    });
  });
});
