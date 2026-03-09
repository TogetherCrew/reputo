import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDeterministicTransferQueries } from '../../../../src/resources/transfers/queries.js';
import { createTransfersRepo } from '../../../../src/resources/transfers/repository.js';
import type { OnchainDataDb } from '../../../../src/shared/types/db.js';
import { cleanupTestDb, createTestDb } from '../../../utils/db-helpers.js';
import { createMockTransfer } from '../../../utils/mock-helpers.js';

describe('Deterministic Transfer Queries', () => {
  let db: OnchainDataDb;
  let queries: ReturnType<typeof createDeterministicTransferQueries>;
  let repo: ReturnType<typeof createTransfersRepo>;

  beforeEach(() => {
    db = createTestDb();
    queries = createDeterministicTransferQueries(db);
    repo = createTransfersRepo(db);
  });

  afterEach(() => {
    cleanupTestDb(db);
  });

  describe('listTransfers', () => {
    it('returns empty array when no transfers exist', () => {
      const result = queries.listTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
        toBlock: 20_000_000,
      });
      expect(result).toEqual([]);
    });

    it('throws for unknown chain', () => {
      expect(() =>
        queries.listTransfers({
          chain: 'unknown-chain',
          tokenContractAddress: '0xtoken',
          toBlock: 100,
        }),
      ).toThrow('Unknown chain');
    });

    it('returns transfers in deterministic order (block_number, transaction_hash, log_index)', () => {
      repo.createMany([
        createMockTransfer({
          chain_id: '1',
          token_address: '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85',
          block_number: 200,
          transaction_hash: '0xtx2',
          log_index: 1,
        }),
        createMockTransfer({
          chain_id: '1',
          token_address: '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85',
          block_number: 200,
          transaction_hash: '0xtx2',
          log_index: 0,
        }),
        createMockTransfer({
          chain_id: '1',
          token_address: '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85',
          block_number: 100,
          transaction_hash: '0xtx1',
          log_index: 0,
        }),
      ]);

      const result = queries.listTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
        toBlock: 300,
      });

      expect(result).toHaveLength(3);
      expect(result[0].blockNumber).toBe(100);
      expect(result[0].transactionHash).toBe('0xtx1');
      expect(result[0].logIndex).toBe(0);
      expect(result[1].blockNumber).toBe(200);
      expect(result[1].transactionHash).toBe('0xtx2');
      expect(result[1].logIndex).toBe(0);
      expect(result[2].blockNumber).toBe(200);
      expect(result[2].transactionHash).toBe('0xtx2');
      expect(result[2].logIndex).toBe(1);
    });

    it('canonicalizes EVM token address so mixed-case input finds rows', () => {
      repo.create(
        createMockTransfer({
          chain_id: '1',
          token_address: '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85',
          block_number: 100,
          transaction_hash: '0xtx1',
          log_index: 0,
        }),
      );

      const result = queries.listTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xAEa46A60368A7bD060Eec7DF8CBa43b7EF41Ad85',
        toBlock: 200,
      });

      expect(result).toHaveLength(1);
      expect(result[0].blockNumber).toBe(100);
    });

    it('point-in-time: toBlock is inclusive (block_number <= toBlock)', () => {
      repo.createMany([
        createMockTransfer({
          chain_id: '1',
          token_address: '0xtoken',
          block_number: 50,
          transaction_hash: '0xtx1',
          log_index: 0,
        }),
        createMockTransfer({
          chain_id: '1',
          token_address: '0xtoken',
          block_number: 100,
          transaction_hash: '0xtx2',
          log_index: 0,
        }),
        createMockTransfer({
          chain_id: '1',
          token_address: '0xtoken',
          block_number: 150,
          transaction_hash: '0xtx3',
          log_index: 0,
        }),
      ]);

      const result = queries.listTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xtoken',
        toBlock: 100,
      });

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.blockNumber)).toEqual([50, 100]);
    });

    it('bounded range: fromBlock and toBlock both inclusive', () => {
      repo.createMany([
        createMockTransfer({
          chain_id: '1',
          token_address: '0xtoken',
          block_number: 50,
          transaction_hash: '0xtx1',
          log_index: 0,
        }),
        createMockTransfer({
          chain_id: '1',
          token_address: '0xtoken',
          block_number: 100,
          transaction_hash: '0xtx2',
          log_index: 0,
        }),
        createMockTransfer({
          chain_id: '1',
          token_address: '0xtoken',
          block_number: 150,
          transaction_hash: '0xtx3',
          log_index: 0,
        }),
      ]);

      const result = queries.listTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xtoken',
        fromBlock: 75,
        toBlock: 125,
      });

      expect(result).toHaveLength(1);
      expect(result[0].blockNumber).toBe(100);
    });

    it('returns same result on repeated calls (stable across unchanged DB)', () => {
      repo.create(
        createMockTransfer({
          chain_id: '1',
          token_address: '0xtoken',
          block_number: 100,
          transaction_hash: '0xtx1',
          log_index: 0,
        }),
      );

      const first = queries.listTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xtoken',
        toBlock: 200,
      });
      const second = queries.listTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xtoken',
        toBlock: 200,
      });

      expect(first).toHaveLength(1);
      expect(second).toHaveLength(1);
      expect(first[0].blockNumber).toBe(second[0].blockNumber);
      expect(first[0].transactionHash).toBe(second[0].transactionHash);
      expect(first[0].logIndex).toBe(second[0].logIndex);
    });

    it('filters by token: other token transfers are excluded', () => {
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
          token_address: '0xtokenB',
          block_number: 100,
          transaction_hash: '0xtx2',
          log_index: 0,
        }),
      ]);

      const result = queries.listTransfers({
        chain: 'ethereum',
        tokenContractAddress: '0xtokenA',
        toBlock: 200,
      });

      expect(result).toHaveLength(1);
      expect(result[0].tokenAddress).toBe('0xtokena');
    });
  });
});
