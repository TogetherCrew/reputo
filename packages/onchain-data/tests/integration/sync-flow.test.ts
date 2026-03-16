import type { DataSource } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AssetTransferRepository } from '../../src/db/repos/asset-transfer-repo.js';
import { createAssetTransferRepository } from '../../src/db/repos/asset-transfer-repo.js';
import type { AssetTransferSyncStateRepository } from '../../src/db/repos/asset-transfer-sync-state-repo.js';
import { createAssetTransferSyncStateRepository } from '../../src/db/repos/asset-transfer-sync-state-repo.js';
import type { AssetTransferEntity } from '../../src/db/schema.js';
import type { AlchemyEthereumAssetTransferProvider } from '../../src/providers/ethereum/alchemy-ethereum-asset-transfer-provider.js';
import { normalizeAlchemyEthereumTransfer } from '../../src/providers/ethereum/normalize-alchemy-transfer.js';
import { DefaultSyncAssetTransfersService } from '../../src/services/sync-asset-transfers-service.js';
import { type AssetKey, OnchainAssets } from '../../src/shared/index.js';

const FET_ETHEREUM: AssetKey = 'fet_ethereum';
const asset = OnchainAssets.fet_ethereum;
const FET_START_BLOCK = asset.startblock;
const FET_START_BLOCK_NUM = parseInt(FET_START_BLOCK, 16);

function blockToHex(n: number): string {
  return `0x${n.toString(16)}`;
}

import { closeTestDataSource, createTestDataSource } from '../utils/db-helpers.js';
import { createMockAlchemyTransfer } from '../utils/mock-helpers.js';

describe('Sync Flow Integration', () => {
  let ds: DataSource;
  let transferRepo: AssetTransferRepository;
  let syncStateRepo: AssetTransferSyncStateRepository;
  const fixedClock = () => '2024-01-15T12:00:00.000Z';

  beforeEach(async () => {
    ds = await createTestDataSource();
    transferRepo = createAssetTransferRepository(ds);
    syncStateRepo = createAssetTransferSyncStateRepository(ds);
  });

  afterEach(async () => {
    await closeTestDataSource(ds);
  });

  function makeProvider(
    toBlock: number,
    batchesFn: () => AsyncGenerator<{
      items: AssetTransferEntity[];
      lastBlock: string;
    }>,
  ): AlchemyEthereumAssetTransferProvider {
    return {
      getToBlock: vi.fn().mockResolvedValue(blockToHex(toBlock)),
      fetchAssetTransfers: batchesFn,
    };
  }

  it('first sync writes transfers and creates sync state', async () => {
    const block1 = FET_START_BLOCK_NUM;
    const block2 = FET_START_BLOCK_NUM + 1;
    const toBlock = FET_START_BLOCK_NUM + 100;
    const transfers = [
      createMockAlchemyTransfer({
        blockNum: blockToHex(block1),
        uniqueId: '0xaaa:log:0x0',
        hash: '0xaaa',
        from: '0x1111111111111111111111111111111111111111',
        to: '0x2222222222222222222222222222222222222222',
        value: 100,
      }),
      createMockAlchemyTransfer({
        blockNum: blockToHex(block2),
        uniqueId: '0xbbb:log:0x1',
        hash: '0xbbb',
        from: '0x3333333333333333333333333333333333333333',
        to: '0x2222222222222222222222222222222222222222',
        value: 200,
      }),
    ];

    async function* batches() {
      const items = transfers.map((t) =>
        normalizeAlchemyEthereumTransfer({
          assetKey: FET_ETHEREUM,
          transfer: t,
        }),
      );
      yield { items, lastBlock: blockToHex(block2) };
    }

    const provider = makeProvider(toBlock, batches);
    const service = new DefaultSyncAssetTransfersService(
      FET_ETHEREUM,
      ds,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );

    const result = await service.sync();
    expect(result.insertedCount).toBe(2);
    expect(result.fromBlock).toBe(FET_START_BLOCK);

    const syncState = await syncStateRepo.findByAssetKey(FET_ETHEREUM);
    expect(syncState).not.toBeNull();
    expect(syncState?.lastSyncedBlock).toBe(blockToHex(block2));
  });

  it('second sync only fetches new blocks', async () => {
    const lastSynced = FET_START_BLOCK_NUM + 50;
    await syncStateRepo.upsert({
      chain: asset.chain,
      assetIdentifier: asset.assetIdentifier,
      lastSyncedBlock: blockToHex(lastSynced),
      updatedAt: '2024-01-14T00:00:00.000Z',
    });

    const fetchFn = vi.fn();
    const newBlock = lastSynced;
    const toBlock = FET_START_BLOCK_NUM + 200;
    async function* batches() {
      fetchFn();
      const raw = createMockAlchemyTransfer({
        blockNum: blockToHex(newBlock),
        uniqueId: '0xccc:log:0x0',
        hash: '0xccc',
      });
      const items = [
        normalizeAlchemyEthereumTransfer({
          assetKey: FET_ETHEREUM,
          transfer: raw,
        }),
      ];
      yield { items, lastBlock: blockToHex(newBlock) };
    }

    const provider = makeProvider(toBlock, batches);
    const service = new DefaultSyncAssetTransfersService(
      FET_ETHEREUM,
      ds,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );

    const result = await service.sync();
    expect(result.fromBlock).toBe(blockToHex(lastSynced));
    expect(result.toBlock).toBe(blockToHex(toBlock));
    expect(result.insertedCount).toBe(1);
  });

  it('provider failure before flush does not persist buffered page or sync state', async () => {
    const block1 = FET_START_BLOCK_NUM;
    const toBlock = FET_START_BLOCK_NUM + 100;
    const transfer1 = createMockAlchemyTransfer({
      blockNum: blockToHex(block1),
      uniqueId: '0xfirst:log:0x0',
      hash: '0xfirst',
    });

    let batchIndex = 0;
    async function* batches() {
      const items = [
        normalizeAlchemyEthereumTransfer({
          assetKey: FET_ETHEREUM,
          transfer: transfer1,
        }),
      ];
      yield { items, lastBlock: blockToHex(block1) };
      batchIndex++;
      throw new Error('Provider failure');
    }

    const provider = makeProvider(toBlock, batches);
    const service = new DefaultSyncAssetTransfersService(
      FET_ETHEREUM,
      ds,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );

    await expect(service.sync()).rejects.toThrow('Provider failure');

    const syncState = await syncStateRepo.findByAssetKey(FET_ETHEREUM);
    expect(syncState).toBeNull();
    expect(batchIndex).toBe(1);
  });

  it('rolls back transfer inserts when sync-state upsert fails during flush', async () => {
    const block = FET_START_BLOCK_NUM;
    const toBlock = FET_START_BLOCK_NUM + 100;
    const trackedAddress = '0xaaaa000000000000000000000000000000000001';

    async function* batches() {
      const items = Array.from({ length: 10_000 }, (_, i) =>
        normalizeAlchemyEthereumTransfer({
          assetKey: FET_ETHEREUM,
          transfer: createMockAlchemyTransfer({
            blockNum: blockToHex(block),
            uniqueId: `0xrollback-${i}:log:0x${i.toString(16)}`,
            hash: `0xrollback-${i}`,
            from: trackedAddress,
          }),
        }),
      );
      yield { items, lastBlock: blockToHex(block) };
    }

    const provider = makeProvider(toBlock, batches);
    const failingSyncStateRepo: AssetTransferSyncStateRepository = {
      findByAssetKey: syncStateRepo.findByAssetKey,
      upsert: vi.fn().mockRejectedValue(new Error('sync state write failed')),
    };

    const service = new DefaultSyncAssetTransfersService(
      FET_ETHEREUM,
      ds,
      transferRepo,
      failingSyncStateRepo,
      provider,
      fixedClock,
    );

    await expect(service.sync()).rejects.toThrow('sync state write failed');

    const syncState = await syncStateRepo.findByAssetKey(FET_ETHEREUM);
    expect(syncState).toBeNull();

    const persistedTransfers = await transferRepo.findTransfersByAddresses({
      assetKey: FET_ETHEREUM,
      addresses: [trackedAddress],
      limit: 20_000,
    });
    expect(persistedTransfers.items).toHaveLength(0);
  });

  it('synced data can be queried by findTransfersByAddresses', async () => {
    const addr = '0xaaaa000000000000000000000000000000000001';
    const other = '0xbbbb000000000000000000000000000000000002';

    const block1 = FET_START_BLOCK_NUM;
    const block2 = FET_START_BLOCK_NUM + 1;
    const block3 = FET_START_BLOCK_NUM + 2;
    const toBlock = FET_START_BLOCK_NUM + 100;
    const transfers = [
      createMockAlchemyTransfer({
        blockNum: blockToHex(block1),
        uniqueId: '0xout1:log:0x0',
        hash: '0xout1',
        from: addr,
        to: other,
        value: 10,
      }),
      createMockAlchemyTransfer({
        blockNum: blockToHex(block2),
        uniqueId: '0xin1:log:0x0',
        hash: '0xin1',
        from: other,
        to: addr,
        value: 20,
      }),
      createMockAlchemyTransfer({
        blockNum: blockToHex(block3),
        uniqueId: '0xout2:log:0x0',
        hash: '0xout2',
        from: addr,
        to: other,
        value: 30,
      }),
    ];

    async function* batches() {
      const items = transfers.map((t) =>
        normalizeAlchemyEthereumTransfer({
          assetKey: FET_ETHEREUM,
          transfer: t,
        }),
      );
      yield { items, lastBlock: blockToHex(block3) };
    }

    const provider = makeProvider(toBlock, batches);
    const service = new DefaultSyncAssetTransfersService(
      FET_ETHEREUM,
      ds,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );
    await service.sync();

    const all = await transferRepo.findTransfersByAddresses({
      assetKey: FET_ETHEREUM,
      addresses: [addr],
      limit: 100,
    });
    expect(all.items).toHaveLength(3);

    const rangeFiltered = await transferRepo.findTransfersByAddresses({
      assetKey: FET_ETHEREUM,
      addresses: [addr],
      limit: 100,
      fromBlock: blockToHex(block1),
      toBlock: blockToHex(block2),
    });
    expect(rangeFiltered.items).toHaveLength(2);

    const noResults = await transferRepo.findTransfersByAddresses({
      assetKey: FET_ETHEREUM,
      addresses: [addr],
      limit: 100,
      fromBlock: blockToHex(FET_START_BLOCK_NUM + 1_000_000),
      toBlock: blockToHex(FET_START_BLOCK_NUM + 2_000_000),
    });
    expect(noResults.items).toHaveLength(0);
  });
});
