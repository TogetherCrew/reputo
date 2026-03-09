import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTransfersRepo } from '../../../../src/resources/transfers/repository.js';
import type { OnchainDataDb } from '../../../../src/shared/types/db.js';
import { cleanupTestDb, createTestDb } from '../../../utils/db-helpers.js';
import { createMockTransfer } from '../../../utils/mock-helpers.js';

describe('Transfers Repository', () => {
  let db: OnchainDataDb;
  let repo: ReturnType<typeof createTransfersRepo>;

  beforeEach(() => {
    db = createTestDb();
    repo = createTransfersRepo(db);
  });

  afterEach(() => {
    cleanupTestDb(db);
  });

  describe('create', () => {
    it('should insert a single transfer', () => {
      const transfer = createMockTransfer({ transaction_hash: '0xtx1', log_index: 0 });

      repo.create(transfer);

      const all = repo.findAll();
      expect(all).toHaveLength(1);
      expect(all[0].transactionHash).toBe('0xtx1');
    });
  });

  describe('createMany', () => {
    it('should insert multiple transfers', () => {
      const transfers = [
        createMockTransfer({ transaction_hash: '0xtx1', log_index: 0 }),
        createMockTransfer({ transaction_hash: '0xtx2', log_index: 0 }),
        createMockTransfer({ transaction_hash: '0xtx3', log_index: 0 }),
      ];

      repo.createMany(transfers);

      const all = repo.findAll();
      expect(all).toHaveLength(3);
    });

    it('should respect chunk size', () => {
      const transfers = [
        createMockTransfer({ transaction_hash: '0xtx1', log_index: 0 }),
        createMockTransfer({ transaction_hash: '0xtx2', log_index: 0 }),
        createMockTransfer({ transaction_hash: '0xtx3', log_index: 0 }),
      ];

      repo.createMany(transfers, { chunkSize: 1 });

      const all = repo.findAll();
      expect(all).toHaveLength(3);
    });
  });

  describe('findAll', () => {
    it('should return all transfers', () => {
      repo.create(createMockTransfer({ transaction_hash: '0xtx1', log_index: 0 }));
      repo.create(createMockTransfer({ transaction_hash: '0xtx2', log_index: 0 }));

      const result = repo.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should find transfer by ID', () => {
      repo.create(createMockTransfer({ transaction_hash: '0xtx1', log_index: 0 }));

      const result = repo.findById(1);
      expect(result).toBeDefined();
      expect(result?.transactionHash).toBe('0xtx1');
    });

    it('should return undefined for non-existent ID', () => {
      const result = repo.findById(999);
      expect(result).toBeUndefined();
    });
  });

  describe('findByQuery', () => {
    beforeEach(() => {
      repo.createMany([
        createMockTransfer({
          chain_id: '1',
          token_address: '0xtokenA',
          block_number: 100,
          transaction_hash: '0xtx1',
          log_index: 0,
        }),
        createMockTransfer({
          chain_id: '1',
          token_address: '0xtokenA',
          block_number: 200,
          transaction_hash: '0xtx2',
          log_index: 0,
        }),
        createMockTransfer({
          chain_id: '1',
          token_address: '0xtokenB',
          block_number: 150,
          transaction_hash: '0xtx3',
          log_index: 0,
        }),
        createMockTransfer({
          chain_id: '137',
          token_address: '0xtokenA',
          block_number: 50,
          transaction_hash: '0xtx4',
          log_index: 0,
        }),
      ]);
    });

    it('should filter by chainId', () => {
      const result = repo.findByQuery({ chainId: '1' });
      expect(result).toHaveLength(3);
    });

    it('should filter by chainId and tokenAddress', () => {
      // Addresses are stored canonicalized (lowercase)
      const result = repo.findByQuery({ chainId: '1', tokenAddress: '0xtokena' });
      expect(result).toHaveLength(2);
    });

    it('should filter by block range', () => {
      const result = repo.findByQuery({ chainId: '1', fromBlock: 100, toBlock: 150 });
      expect(result).toHaveLength(2);
    });

    it('should order results by block_number then log_index', () => {
      const result = repo.findByQuery({ chainId: '1' });
      expect(result[0].blockNumber).toBe(100);
      expect(result[1].blockNumber).toBe(150);
      expect(result[2].blockNumber).toBe(200);
    });
  });

  describe('findByAddress', () => {
    beforeEach(() => {
      repo.createMany([
        createMockTransfer({ from_address: '0xalice', to_address: '0xbob', transaction_hash: '0xtx1', log_index: 0 }),
        createMockTransfer({ from_address: '0xbob', to_address: '0xcharlie', transaction_hash: '0xtx2', log_index: 0 }),
        createMockTransfer({
          from_address: '0xcharlie',
          to_address: '0xalice',
          transaction_hash: '0xtx3',
          log_index: 0,
        }),
      ]);
    });

    it('should find transfers from an address', () => {
      const result = repo.findByAddress('1', '0xalice', 'from');
      expect(result).toHaveLength(1);
      expect(result[0].fromAddress).toBe('0xalice');
    });

    it('should find transfers to an address', () => {
      const result = repo.findByAddress('1', '0xalice', 'to');
      expect(result).toHaveLength(1);
      expect(result[0].toAddress).toBe('0xalice');
    });

    it('should find transfers in either direction by default', () => {
      const result = repo.findByAddress('1', '0xalice');
      expect(result).toHaveLength(2);
    });

    it('should scope results to chain_id', () => {
      repo.create(
        createMockTransfer({ chain_id: '137', from_address: '0xalice', transaction_hash: '0xtx4', log_index: 0 }),
      );

      const chain1 = repo.findByAddress('1', '0xalice');
      const chain137 = repo.findByAddress('137', '0xalice');

      expect(chain1).toHaveLength(2);
      expect(chain137).toHaveLength(1);
    });
  });
});
