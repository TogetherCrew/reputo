import type { DataSource } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AssetTransferRepository } from '../../../../src/db/repos/asset-transfer-repo.js';
import { createAssetTransferRepository } from '../../../../src/db/repos/asset-transfer-repo.js';
import type { AssetKey } from '../../../../src/shared/index.js';
import { closeTestDataSource, createTestDataSource } from '../../../utils/db-helpers.js';
import { createMockAssetTransferRecord } from '../../../utils/mock-helpers.js';

const FET_ETHEREUM: AssetKey = 'fet_ethereum';

describe('AssetTransferRepository', () => {
  let ds: DataSource;
  let repo: AssetTransferRepository;

  beforeEach(async () => {
    ds = await createTestDataSource();
    repo = createAssetTransferRepository(ds);
  });

  afterEach(async () => {
    await closeTestDataSource(ds);
  });

  describe('insertMany', () => {
    it('inserts records and returns the count', async () => {
      const records = [
        createMockAssetTransferRecord({ transactionHash: '0x001', logIndex: 0 }),
        createMockAssetTransferRecord({ transactionHash: '0x002', logIndex: 0 }),
      ];

      const count = await repo.insertMany(records);
      expect(count).toBe(2);
    });

    it('ignores duplicate records based on primary key', async () => {
      const record = createMockAssetTransferRecord({
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

  describe('findTransfersByAddresses', () => {
    const addr1 = '0xaaaa000000000000000000000000000000000001';
    const addr2 = '0xbbbb000000000000000000000000000000000002';
    const other = '0xcccc000000000000000000000000000000000003';

    beforeEach(async () => {
      await repo.insertMany([
        createMockAssetTransferRecord({
          transactionHash: '0x001',
          logIndex: 0,
          fromAddress: addr1,
          toAddress: other,
          blockNumber: '0x64',
        }),
        createMockAssetTransferRecord({
          transactionHash: '0x002',
          logIndex: 0,
          fromAddress: other,
          toAddress: addr2,
          blockNumber: '0xc8',
        }),
        createMockAssetTransferRecord({
          transactionHash: '0x003',
          logIndex: 0,
          fromAddress: addr1,
          toAddress: addr2,
          blockNumber: '0x12c',
        }),
        createMockAssetTransferRecord({
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
        assetKey: FET_ETHEREUM,
        addresses: [addr1, addr2],
        limit: 10,
      });
      expect(result.items).toHaveLength(3);
      expect(result.nextCursor).toBeNull();
    });

    it('paginates with cursor', async () => {
      const page1 = await repo.findTransfersByAddresses({
        assetKey: FET_ETHEREUM,
        addresses: [addr1, addr2],
        limit: 2,
      });
      expect(page1.items).toHaveLength(2);
      expect(page1.nextCursor).not.toBeNull();
      const cursor = page1.nextCursor;
      if (!cursor) throw new Error('Expected cursor to be present');

      const page2 = await repo.findTransfersByAddresses({
        assetKey: FET_ETHEREUM,
        addresses: [addr1, addr2],
        limit: 2,
        cursor,
      });
      expect(page2.items).toHaveLength(1);
      expect(page2.nextCursor).toBeNull();
    });

    it('returns empty result for empty addresses array', async () => {
      const result = await repo.findTransfersByAddresses({
        assetKey: FET_ETHEREUM,
        addresses: [],
        limit: 10,
      });
      expect(result.items).toHaveLength(0);
      expect(result.nextCursor).toBeNull();
    });

    it('orders by block_number then log_index', async () => {
      const result = await repo.findTransfersByAddresses({
        assetKey: FET_ETHEREUM,
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

    it('filters by block range', async () => {
      const result = await repo.findTransfersByAddresses({
        assetKey: FET_ETHEREUM,
        addresses: [addr1, addr2],
        limit: 10,
        fromBlock: '0xc8',
        toBlock: '0x12c',
      });

      expect(result.items).toHaveLength(2);
      expect(result.items.every((item) => BigInt(item.blockNumber) >= BigInt('0xc8'))).toBe(true);
      expect(result.items.every((item) => BigInt(item.blockNumber) <= BigInt('0x12c'))).toBe(true);
    });
  });
});
