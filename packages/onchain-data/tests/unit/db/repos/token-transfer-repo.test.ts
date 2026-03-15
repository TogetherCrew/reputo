import type { DataSource } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { TokenTransferRepository } from '../../../../src/db/repos/token-transfer-repo.js';
import { createTokenTransferRepository } from '../../../../src/db/repos/token-transfer-repo.js';
import { SupportedTokenChain, TransferDirection } from '../../../../src/shared/index.js';
import { closeTestDataSource, createTestDataSource } from '../../../utils/db-helpers.js';
import { createMockTokenTransferRecord } from '../../../utils/mock-helpers.js';

describe('TokenTransferRepository', () => {
  let ds: DataSource;
  let repo: TokenTransferRepository;

  beforeEach(async () => {
    ds = await createTestDataSource();
    repo = createTokenTransferRepository(ds);
  });

  afterEach(async () => {
    await closeTestDataSource(ds);
  });

  describe('insertMany', () => {
    it('inserts records and returns the count', async () => {
      const records = [
        createMockTokenTransferRecord({ id: 'r1', transactionHash: '0x001', logIndex: 0 }),
        createMockTokenTransferRecord({ id: 'r2', transactionHash: '0x002', logIndex: 0 }),
      ];

      const count = await repo.insertMany(records);
      expect(count).toBe(2);
    });

    it('ignores duplicate records based on primary key', async () => {
      const record = createMockTokenTransferRecord({
        id: 'r1',
        transactionHash: '0xdup',
        logIndex: 0,
      });

      await repo.insertMany([record]);
      const count = await repo.insertMany([record]);
      expect(count).toBe(0);
    });

    it('inserts zero records for empty input', async () => {
      const count = await repo.insertMany([]);
      expect(count).toBe(0);
    });
  });

  describe('findByAddress', () => {
    const sender = '0xaaaa000000000000000000000000000000000001';
    const receiver = '0xbbbb000000000000000000000000000000000002';

    beforeEach(async () => {
      await repo.insertMany([
        createMockTokenTransferRecord({
          id: 'r1',
          transactionHash: '0x001',
          logIndex: 0,
          fromAddress: sender,
          toAddress: receiver,
          blockNumber: '0x64',
        }),
        createMockTokenTransferRecord({
          id: 'r2',
          transactionHash: '0x002',
          logIndex: 0,
          fromAddress: receiver,
          toAddress: sender,
          blockNumber: '0xc8',
        }),
        createMockTokenTransferRecord({
          id: 'r3',
          transactionHash: '0x003',
          logIndex: 0,
          fromAddress: sender,
          toAddress: receiver,
          blockNumber: '0x12c',
        }),
      ]);
    });

    it('finds all transfers for an address (default direction = both)', async () => {
      const results = await repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: sender,
      });
      expect(results).toHaveLength(3);
    });

    it('filters inbound transfers only', async () => {
      const results = await repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: sender,
        direction: TransferDirection.INBOUND,
      });
      expect(results).toHaveLength(1);
      expect(results[0].toAddress).toBe(sender);
    });

    it('filters outbound transfers only', async () => {
      const results = await repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: sender,
        direction: TransferDirection.OUTBOUND,
      });
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.fromAddress === sender)).toBe(true);
    });

    it('filters by fromBlock', async () => {
      const results = await repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: sender,
        fromBlock: '0xc8',
      });
      expect(results).toHaveLength(2);
      expect(results.every((r) => BigInt(r.blockNumber) >= BigInt('0xc8'))).toBe(true);
    });

    it('filters by toBlock', async () => {
      const results = await repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: sender,
        toBlock: '0xc8',
      });
      expect(results).toHaveLength(2);
      expect(results.every((r) => BigInt(r.blockNumber) <= BigInt('0xc8'))).toBe(true);
    });

    it('filters by both fromBlock and toBlock', async () => {
      const results = await repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: sender,
        fromBlock: '0x64',
        toBlock: '0xc8',
      });
      expect(results).toHaveLength(2);
    });

    it('normalizes the query address to lowercase', async () => {
      const results = await repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: sender.toUpperCase(),
      });
      expect(results).toHaveLength(3);
    });

    it('returns empty array when no matches found', async () => {
      const results = await repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: '0x0000000000000000000000000000000000000000',
      });
      expect(results).toHaveLength(0);
    });

    it('orders results by block number ascending', async () => {
      const results = await repo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: sender,
      });
      for (let i = 1; i < results.length; i++) {
        expect(BigInt(results[i].blockNumber)).toBeGreaterThanOrEqual(BigInt(results[i - 1].blockNumber));
      }
    });
  });

  describe('findTransfersByAddresses', () => {
    const addr1 = '0xaaaa000000000000000000000000000000000001';
    const addr2 = '0xbbbb000000000000000000000000000000000002';
    const other = '0xcccc000000000000000000000000000000000003';

    beforeEach(async () => {
      await repo.insertMany([
        createMockTokenTransferRecord({
          transactionHash: '0x001',
          logIndex: 0,
          fromAddress: addr1,
          toAddress: other,
          blockNumber: '0x64',
        }),
        createMockTokenTransferRecord({
          transactionHash: '0x002',
          logIndex: 0,
          fromAddress: other,
          toAddress: addr2,
          blockNumber: '0xc8',
        }),
        createMockTokenTransferRecord({
          transactionHash: '0x003',
          logIndex: 0,
          fromAddress: addr1,
          toAddress: addr2,
          blockNumber: '0x12c',
        }),
        createMockTokenTransferRecord({
          transactionHash: '0x004',
          logIndex: 0,
          fromAddress: other,
          toAddress: other,
          blockNumber: '0x190',
        }),
      ]);
    });

    it('returns transfers where from or to is in the address list', async () => {
      const result = await repo.findTransfersByAddresses({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        addresses: [addr1, addr2],
        limit: 10,
      });
      expect(result.items).toHaveLength(3);
      expect(result.nextCursor).toBeNull();
    });

    it('paginates with cursor', async () => {
      const page1 = await repo.findTransfersByAddresses({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        addresses: [addr1, addr2],
        limit: 2,
      });
      expect(page1.items).toHaveLength(2);
      expect(page1.nextCursor).not.toBeNull();

      const page2 = await repo.findTransfersByAddresses({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        addresses: [addr1, addr2],
        limit: 2,
        cursor: page1.nextCursor!,
      });
      expect(page2.items).toHaveLength(1);
      expect(page2.nextCursor).toBeNull();
    });

    it('returns empty result for empty addresses array', async () => {
      const result = await repo.findTransfersByAddresses({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        addresses: [],
        limit: 10,
      });
      expect(result.items).toHaveLength(0);
      expect(result.nextCursor).toBeNull();
    });

    it('orders by block_number then log_index', async () => {
      const result = await repo.findTransfersByAddresses({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        addresses: [addr1, addr2],
        limit: 10,
      });
      for (let i = 1; i < result.items.length; i++) {
        const prev = result.items[i - 1];
        const curr = result.items[i];
        expect(
          BigInt(curr.blockNumber) > BigInt(prev.blockNumber) ||
            (BigInt(curr.blockNumber) === BigInt(prev.blockNumber) && curr.logIndex > prev.logIndex),
        ).toBe(true);
      }
    });
  });
});
