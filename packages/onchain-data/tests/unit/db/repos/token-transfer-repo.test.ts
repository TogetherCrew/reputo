import type BetterSqlite3 from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { TokenTransferRepository } from '../../../../src/db/repos/token-transfer-repo.js';
import { createTokenTransferRepository } from '../../../../src/db/repos/token-transfer-repo.js';
import { SupportedTokenChain, TransferDirection } from '../../../../src/shared/index.js';
import { closeTestDatabase, createTestDatabase } from '../../../utils/db-helpers.js';
import { createMockTokenTransferRecord } from '../../../utils/mock-helpers.js';

describe('TokenTransferRepository', () => {
  let db: BetterSqlite3.Database;
  let repo: TokenTransferRepository;

  beforeEach(() => {
    db = createTestDatabase();
    repo = createTokenTransferRepository(db);
  });

  afterEach(() => {
    closeTestDatabase(db);
  });

  describe('insertMany', () => {
    it('inserts records and returns the count', () => {
      const records = [
        createMockTokenTransferRecord({ id: 'r1', transactionHash: '0x001', logIndex: 0 }),
        createMockTokenTransferRecord({ id: 'r2', transactionHash: '0x002', logIndex: 0 }),
      ];

      const count = repo.insertMany(records);
      expect(count).toBe(2);
    });

    it('ignores duplicate records based on unique index', () => {
      const record = createMockTokenTransferRecord({
        id: 'r1',
        transactionHash: '0xdup',
        logIndex: 0,
      });

      repo.insertMany([record]);
      const count = repo.insertMany([record]);
      expect(count).toBe(0);
    });

    it('inserts zero records for empty input', () => {
      const count = repo.insertMany([]);
      expect(count).toBe(0);
    });
  });

  describe('findByAddress', () => {
    const sender = '0xaaaa000000000000000000000000000000000001';
    const receiver = '0xbbbb000000000000000000000000000000000002';

    beforeEach(() => {
      repo.insertMany([
        createMockTokenTransferRecord({
          id: 'r1',
          transactionHash: '0x001',
          logIndex: 0,
          fromAddress: sender,
          toAddress: receiver,
          blockNumber: 100,
        }),
        createMockTokenTransferRecord({
          id: 'r2',
          transactionHash: '0x002',
          logIndex: 0,
          fromAddress: receiver,
          toAddress: sender,
          blockNumber: 200,
        }),
        createMockTokenTransferRecord({
          id: 'r3',
          transactionHash: '0x003',
          logIndex: 0,
          fromAddress: sender,
          toAddress: receiver,
          blockNumber: 300,
        }),
      ]);
    });

    it('finds all transfers for an address (default direction = both)', () => {
      const results = repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: sender,
      });
      expect(results).toHaveLength(3);
    });

    it('filters inbound transfers only', () => {
      const results = repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: sender,
        direction: TransferDirection.INBOUND,
      });
      expect(results).toHaveLength(1);
      expect(results[0].toAddress).toBe(sender);
    });

    it('filters outbound transfers only', () => {
      const results = repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: sender,
        direction: TransferDirection.OUTBOUND,
      });
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.fromAddress === sender)).toBe(true);
    });

    it('filters by fromBlock', () => {
      const results = repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: sender,
        fromBlock: 200,
      });
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.blockNumber >= 200)).toBe(true);
    });

    it('filters by toBlock', () => {
      const results = repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: sender,
        toBlock: 200,
      });
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.blockNumber <= 200)).toBe(true);
    });

    it('filters by both fromBlock and toBlock', () => {
      const results = repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: sender,
        fromBlock: 100,
        toBlock: 200,
      });
      expect(results).toHaveLength(2);
    });

    it('normalizes the query address to lowercase', () => {
      const results = repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: sender.toUpperCase(),
      });
      expect(results).toHaveLength(3);
    });

    it('returns empty array when no matches found', () => {
      const results = repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: '0x0000000000000000000000000000000000000000',
      });
      expect(results).toHaveLength(0);
    });

    it('orders results by block number ascending', () => {
      const results = repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: sender,
      });
      for (let i = 1; i < results.length; i++) {
        expect(results[i].blockNumber).toBeGreaterThanOrEqual(results[i - 1].blockNumber);
      }
    });
  });
});
