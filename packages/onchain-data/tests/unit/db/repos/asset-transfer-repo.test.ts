import type { DataSource } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AssetTransferRepository } from '../../../../src/db/repos/asset-transfer-repo.js';
import { createAssetTransferRepository } from '../../../../src/db/repos/asset-transfer-repo.js';
import { AssetTransferSchema } from '../../../../src/db/schema.js';
import { type AssetKey, ONCHAIN_ASSET_KEYS } from '../../../../src/shared/index.js';
import { closeTestDataSource, createTestDataSource } from '../../../utils/db-helpers.js';
import { createMockAssetTransferEntity } from '../../../utils/mock-helpers.js';

const FET_ETHEREUM: AssetKey = 'fet_ethereum';
const FET_ETHEREUM_ID = ONCHAIN_ASSET_KEYS.indexOf(FET_ETHEREUM);

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
    it('inserts entities without mutation', async () => {
      const entities = [
        createMockAssetTransferEntity({ transaction_hash: '0x001', log_index: 0 }),
        createMockAssetTransferEntity({ transaction_hash: '0x002', log_index: 0 }),
      ];

      await repo.insertMany(entities);
    });

    it('ignores duplicate entities based on primary key', async () => {
      const entity = createMockAssetTransferEntity({
        transaction_hash: '0xdup',
        log_index: 0,
      });

      await repo.insertMany([entity]);
      await repo.insertMany([entity]);
    });

    it('inserts inputs larger than 1000 records in chunked writes', async () => {
      const entities = Array.from({ length: 2501 }, (_, i) =>
        createMockAssetTransferEntity({
          transaction_hash: `0x${i.toString(16).padStart(64, '0')}`,
          log_index: i,
        }),
      );

      await repo.insertMany(entities);

      const count = await ds.getRepository(AssetTransferSchema).count();
      expect(count).toBe(2501);
    });

    it('does nothing for empty input', async () => {
      await repo.insertMany([]);
    });
  });

  describe('findTransfersByAddresses', () => {
    const addr1 = '0xaaaa000000000000000000000000000000000001';
    const addr2 = '0xbbbb000000000000000000000000000000000002';
    const other = '0xcccc000000000000000000000000000000000003';

    beforeEach(async () => {
      await repo.insertMany([
        createMockAssetTransferEntity({
          transaction_hash: '0x001',
          log_index: 0,
          from_address: addr1,
          to_address: other,
          block_number: 0x64,
        }),
        createMockAssetTransferEntity({
          transaction_hash: '0x002',
          log_index: 0,
          from_address: other,
          to_address: addr2,
          block_number: 0xc8,
        }),
        createMockAssetTransferEntity({
          transaction_hash: '0x003',
          log_index: 0,
          from_address: addr1,
          to_address: addr2,
          block_number: 0x12c,
        }),
        createMockAssetTransferEntity({
          transaction_hash: '0x004',
          log_index: 0,
          from_address: other,
          to_address: other,
          block_number: 0x190,
        }),
      ]);
    });

    it('returns transfers where from or to is in the address list', async () => {
      const result = await repo.findTransfersByAddresses({
        assetId: FET_ETHEREUM_ID,
        addresses: [addr1, addr2],
        page: 1,
        limit: 10,
        orderBy: 'time_asc',
      });
      expect(result).toHaveLength(3);
    });

    it('paginates with page and limit', async () => {
      const page1 = await repo.findTransfersByAddresses({
        assetId: FET_ETHEREUM_ID,
        addresses: [addr1, addr2],
        page: 1,
        limit: 2,
        orderBy: 'time_asc',
      });
      expect(page1).toHaveLength(2);

      const page2 = await repo.findTransfersByAddresses({
        assetId: FET_ETHEREUM_ID,
        addresses: [addr1, addr2],
        page: 2,
        limit: 2,
        orderBy: 'time_asc',
      });
      expect(page2).toHaveLength(1);
      expect(page1.length + page2.length).toBe(3);
    });

    it('returns empty result for empty addresses array', async () => {
      const result = await repo.findTransfersByAddresses({
        assetId: FET_ETHEREUM_ID,
        addresses: [],
        page: 1,
        limit: 10,
        orderBy: 'time_asc',
      });
      expect(result).toHaveLength(0);
    });

    it('orders by number then log_index', async () => {
      const result = await repo.findTransfersByAddresses({
        assetId: FET_ETHEREUM_ID,
        addresses: [addr1, addr2],
        page: 1,
        limit: 10,
        orderBy: 'time_asc',
      });
      for (let i = 1; i < result.length; i++) {
        const prev = result[i - 1];
        const curr = result[i];
        expect(
          curr.block_number > prev.block_number ||
            (curr.block_number === prev.block_number && curr.log_index > prev.log_index),
        ).toBe(true);
      }
    });

    it('filters by block range', async () => {
      const result = await repo.findTransfersByAddresses({
        assetId: FET_ETHEREUM_ID,
        addresses: [addr1, addr2],
        page: 1,
        limit: 10,
        orderBy: 'time_asc',
        fromBlock: 0xc8,
        toBlock: 0x12c,
      });

      expect(result).toHaveLength(2);
      expect(result.every((item) => item.block_number >= 0xc8)).toBe(true);
      expect(result.every((item) => item.block_number <= 0x12c)).toBe(true);
    });
  });
});
