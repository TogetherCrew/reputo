import type { DataSource } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AssetTransferSyncStore } from '../../../src/db/postgres-sync-store.js';
import { createPostgresSyncStore } from '../../../src/db/postgres-sync-store.js';
import type { AssetTransferSyncStateRepository } from '../../../src/db/repos/asset-transfer-sync-state-repo.js';
import { createAssetTransferSyncStateRepository } from '../../../src/db/repos/asset-transfer-sync-state-repo.js';
import type { AssetTransferEntity } from '../../../src/db/schema.js';
import type { AlchemyEthereumAssetTransferProvider } from '../../../src/providers/ethereum/alchemy-ethereum-asset-transfer-provider.js';
import { normalizeAlchemyEthereumTransfer } from '../../../src/providers/ethereum/normalize-alchemy-transfer.js';
import { DefaultSyncAssetTransfersService } from '../../../src/services/sync-asset-transfers-service.js';
import { type AssetKey, OnchainAssets } from '../../../src/shared/index.js';

const FET_ETHEREUM: AssetKey = 'fet_ethereum';
const asset = OnchainAssets.fet_ethereum;
const FET_START_BLOCK = asset.startblock;
const FET_START_BLOCK_NUM = parseInt(FET_START_BLOCK, 16);
const fixedClock = () => '2024-01-15T12:00:00.000Z';

function blockToHex(n: number): string {
  return `0x${n.toString(16)}`;
}

import {
  closeTestDataSource,
  createTestDataSource,
  getTestDataSourceDatabaseUrl,
  hasContainerRuntime,
} from '../../utils/db-helpers.js';
import { createMockAlchemyTransfer } from '../../utils/mock-helpers.js';

function createMockProvider(
  overrides?: Partial<AlchemyEthereumAssetTransferProvider>,
): AlchemyEthereumAssetTransferProvider {
  return {
    getToBlock: vi.fn().mockResolvedValue(blockToHex(8000000)),
    fetchAssetTransfers: overrides?.fetchAssetTransfers ?? async function* () {},
    ...overrides,
  };
}

const describePostgres = hasContainerRuntime ? describe : describe.skip;

describe('DefaultSyncAssetTransfersService pipeline', () => {
  it('continues fetching pages while a full buffer flush is in flight', async () => {
    const flushGate = createDeferred<void>();
    let pageIndex = 0;
    let pagesFetched = 0;

    const provider: AlchemyEthereumAssetTransferProvider = {
      getToBlock: vi.fn().mockResolvedValue(blockToHex(FET_START_BLOCK_NUM + 20)),
      fetchAssetTransfers: async function* () {
        while (pageIndex < 11) {
          const block = FET_START_BLOCK_NUM + pageIndex;
          pageIndex += 1;
          pagesFetched += 1;
          yield {
            items: Array.from({ length: 1000 }, (_, rowIndex) =>
              normalizeAlchemyEthereumTransfer({
                assetKey: FET_ETHEREUM,
                transfer: createMockAlchemyTransfer({
                  blockNum: blockToHex(block),
                  uniqueId: `0xpipeline-${block}-${rowIndex}:log:0x${rowIndex.toString(16)}`,
                  hash: `0xpipeline-${block}-${rowIndex}`,
                }),
              }),
            ),
            lastBlock: blockToHex(block),
          };
        }
      },
    };

    const store: AssetTransferSyncStore = {
      findByAssetKey: vi.fn().mockResolvedValue(null),
      withTransaction: vi
        .fn()
        .mockImplementationOnce(async (callback) => {
          const result = await callback({
            insertTransferBatch: vi.fn(async (items: AssetTransferEntity[]) => {
              await flushGate.promise;
              return {
                attemptedCount: items.length,
                insertedCount: items.length,
                ignoredCount: 0,
              };
            }),
            upsertSyncState: vi.fn().mockResolvedValue(undefined),
          });
          return result;
        })
        .mockImplementation(async (callback) => {
          return callback({
            insertTransferBatch: vi.fn(async (items: AssetTransferEntity[]) => ({
              attemptedCount: items.length,
              insertedCount: items.length,
              ignoredCount: 0,
            })),
            upsertSyncState: vi.fn().mockResolvedValue(undefined),
          });
        }),
      close: vi.fn().mockResolvedValue(undefined),
    };

    const syncPromise = new DefaultSyncAssetTransfersService(
      FET_ETHEREUM,
      { destroy: vi.fn().mockResolvedValue(undefined) } as unknown as DataSource,
      store,
      provider,
      fixedClock,
    ).sync();

    await vi.waitFor(() => {
      expect(store.withTransaction).toHaveBeenCalledTimes(1);
      expect(pagesFetched).toBeGreaterThan(10);
    });

    flushGate.resolve();

    const result = await syncPromise;
    expect(result.insertedCount).toBe(11_000);
    expect(store.withTransaction).toHaveBeenCalledTimes(2);
  });
});

describePostgres('DefaultSyncAssetTransfersService', () => {
  let ds: DataSource;
  let syncStore: AssetTransferSyncStore;
  let syncStateRepo: AssetTransferSyncStateRepository;

  beforeEach(async () => {
    ds = await createTestDataSource();
    syncStore = await createPostgresSyncStore({
      databaseUrl: getTestDataSourceDatabaseUrl(ds),
    });
    syncStateRepo = createAssetTransferSyncStateRepository(ds);
  });

  afterEach(async () => {
    await syncStore.close();
    await closeTestDataSource(ds);
  });

  it('resolves metadata from assetKey', async () => {
    const provider = createMockProvider();

    const service = new DefaultSyncAssetTransfersService(FET_ETHEREUM, ds, syncStore, provider, fixedClock);

    const result = await service.sync();
    expect(result.assetKey).toBe(FET_ETHEREUM);
    expect(provider.getToBlock).toHaveBeenCalled();
    expect(result.fromBlock).toBe(asset.startblock);
  });

  it('first sync starts from asset startblock', async () => {
    const fetchAssetTransfers = vi.fn(async function* () {});
    const provider = createMockProvider({
      getToBlock: vi.fn().mockResolvedValue(blockToHex(FET_START_BLOCK_NUM + 100)),
      fetchAssetTransfers,
    });

    const service = new DefaultSyncAssetTransfersService(FET_ETHEREUM, ds, syncStore, provider, fixedClock);

    const result = await service.sync();
    expect(result.fromBlock).toBe(FET_START_BLOCK);
    expect(fetchAssetTransfers).toHaveBeenCalledWith({
      assetKey: FET_ETHEREUM,
      assetIdentifier: asset.assetIdentifier,
      fromBlock: FET_START_BLOCK,
      toBlock: blockToHex(FET_START_BLOCK_NUM + 100),
    });
  });

  it('later sync resumes from lastSyncedBlock exactly', async () => {
    await syncStateRepo.upsert({
      chain: asset.chain,
      assetIdentifier: asset.assetIdentifier,
      lastSyncedBlock: blockToHex(7500000),
      updatedAt: '2024-01-14T10:00:00.000Z',
    });

    const fetchAssetTransfers = vi.fn(async function* () {});
    const provider = createMockProvider({ fetchAssetTransfers });

    const service = new DefaultSyncAssetTransfersService(FET_ETHEREUM, ds, syncStore, provider, fixedClock);

    const result = await service.sync();
    expect(result.fromBlock).toBe(blockToHex(7500000));
    expect(fetchAssetTransfers).toHaveBeenCalledWith({
      assetKey: FET_ETHEREUM,
      assetIdentifier: asset.assetIdentifier,
      fromBlock: blockToHex(7500000),
      toBlock: blockToHex(8000000),
    });
  });

  it('provider getToBlock() value is used as sync upper bound', async () => {
    const provider = createMockProvider({
      getToBlock: vi.fn().mockResolvedValue(blockToHex(9999999)),
    });

    const service = new DefaultSyncAssetTransfersService(FET_ETHEREUM, ds, syncStore, provider, fixedClock);

    const result = await service.sync();
    expect(result.toBlock).toBe(blockToHex(9999999));
  });

  it('returns zero insertedCount when fromBlock > toBlock', async () => {
    await syncStateRepo.upsert({
      chain: asset.chain,
      assetIdentifier: asset.assetIdentifier,
      lastSyncedBlock: blockToHex(9000000),
      updatedAt: '2024-01-14T10:00:00.000Z',
    });

    const provider = createMockProvider({
      getToBlock: vi.fn().mockResolvedValue(blockToHex(8000000)),
    });

    const service = new DefaultSyncAssetTransfersService(FET_ETHEREUM, ds, syncStore, provider, fixedClock);

    const result = await service.sync();
    expect(result.insertedCount).toBe(0);
    expect(result.fromBlock).toBe(blockToHex(9000000));
    expect(result.toBlock).toBe(blockToHex(8000000));
  });

  it('inserts transfers and updates sync state per batch', async () => {
    const block1 = FET_START_BLOCK_NUM;
    const block2 = FET_START_BLOCK_NUM + 1;
    const transfers = [
      createMockAlchemyTransfer({
        blockNum: blockToHex(block1),
        uniqueId: '0xaaa:log:0x0',
        hash: '0xaaa',
        from: '0x1111111111111111111111111111111111111111',
        to: '0x2222222222222222222222222222222222222222',
        value: 50,
      }),
      createMockAlchemyTransfer({
        blockNum: blockToHex(block2),
        uniqueId: '0xbbb:log:0x0',
        hash: '0xbbb',
        from: '0x3333333333333333333333333333333333333333',
        to: '0x4444444444444444444444444444444444444444',
        value: 75,
      }),
    ];

    const toBlock = FET_START_BLOCK_NUM + 100;
    async function* mockFetch() {
      const items = transfers.map((t) =>
        normalizeAlchemyEthereumTransfer({
          assetKey: FET_ETHEREUM,
          transfer: t,
        }),
      );
      yield { items, lastBlock: blockToHex(block2) };
    }

    const provider = createMockProvider({
      getToBlock: vi.fn().mockResolvedValue(blockToHex(toBlock)),
      fetchAssetTransfers: mockFetch,
    });

    const service = new DefaultSyncAssetTransfersService(FET_ETHEREUM, ds, syncStore, provider, fixedClock);

    const result = await service.sync();
    expect(result.insertedCount).toBe(2);

    const syncState = await syncStateRepo.findByAssetKey(FET_ETHEREUM);
    expect(syncState?.lastSyncedBlock).toBe(blockToHex(block2));
  });

  it('duplicate transfer rows are ignored', async () => {
    const transfer = createMockAlchemyTransfer({
      blockNum: FET_START_BLOCK,
      uniqueId: '0xdup:log:0x0',
      hash: '0xdup',
    });

    const toBlock = FET_START_BLOCK_NUM + 100;
    async function* mockFetch() {
      const items = [transfer, transfer].map((t) =>
        normalizeAlchemyEthereumTransfer({
          assetKey: FET_ETHEREUM,
          transfer: t,
        }),
      );
      yield { items, lastBlock: FET_START_BLOCK };
    }

    const provider = createMockProvider({
      getToBlock: vi.fn().mockResolvedValue(blockToHex(toBlock)),
      fetchAssetTransfers: mockFetch,
    });

    const service = new DefaultSyncAssetTransfersService(FET_ETHEREUM, ds, syncStore, provider, fixedClock);

    const result = await service.sync();
    expect(result.insertedCount).toBe(2);
  });

  it('handles multiple batches correctly', async () => {
    const block1 = FET_START_BLOCK_NUM;
    const block2 = FET_START_BLOCK_NUM + 1;
    const toBlock = FET_START_BLOCK_NUM + 100;
    async function* mockFetch() {
      yield {
        items: [
          normalizeAlchemyEthereumTransfer({
            assetKey: FET_ETHEREUM,
            transfer: createMockAlchemyTransfer({
              blockNum: blockToHex(block1),
              uniqueId: '0xfirst:log:0x0',
              hash: '0xfirst',
            }),
          }),
        ],
        lastBlock: blockToHex(block1),
      };
      yield {
        items: [
          normalizeAlchemyEthereumTransfer({
            assetKey: FET_ETHEREUM,
            transfer: createMockAlchemyTransfer({
              blockNum: blockToHex(block2),
              uniqueId: '0xsecond:log:0x0',
              hash: '0xsecond',
            }),
          }),
        ],
        lastBlock: blockToHex(block2),
      };
    }

    const provider = createMockProvider({
      getToBlock: vi.fn().mockResolvedValue(blockToHex(toBlock)),
      fetchAssetTransfers: mockFetch,
    });

    const service = new DefaultSyncAssetTransfersService(FET_ETHEREUM, ds, syncStore, provider, fixedClock);

    const result = await service.sync();
    expect(result.insertedCount).toBe(2);

    const syncState = await syncStateRepo.findByAssetKey(FET_ETHEREUM);
    expect(syncState?.lastSyncedBlock).toBe(blockToHex(block2));
  });

  it('flushes after buffering 10,000 items even if provider fails later', async () => {
    const toBlock = FET_START_BLOCK_NUM + 100;
    const flushBoundaryBlock = FET_START_BLOCK_NUM + 9;

    async function* mockFetch() {
      for (let i = 0; i < 10; i++) {
        const block = FET_START_BLOCK_NUM + i;
        const pageItems = Array.from({ length: 1000 }, (_, j) =>
          normalizeAlchemyEthereumTransfer({
            assetKey: FET_ETHEREUM,
            transfer: createMockAlchemyTransfer({
              blockNum: blockToHex(block),
              uniqueId: `0xbuffer-${i}-${j}:log:0x${j.toString(16)}`,
              hash: `0xbuffer-${i}-${j}`,
            }),
          }),
        );
        yield {
          items: pageItems,
          lastBlock: blockToHex(block),
        };
      }
      throw new Error('Provider failure after first 10000-item flush');
    }

    const provider = createMockProvider({
      getToBlock: vi.fn().mockResolvedValue(blockToHex(toBlock)),
      fetchAssetTransfers: mockFetch,
    });

    const service = new DefaultSyncAssetTransfersService(FET_ETHEREUM, ds, syncStore, provider, fixedClock);

    await expect(service.sync()).rejects.toThrow('Provider failure after first 10000-item flush');

    const syncState = await syncStateRepo.findByAssetKey(FET_ETHEREUM);
    expect(syncState?.lastSyncedBlock).toBe(blockToHex(flushBoundaryBlock));
  });
});

function createDeferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
} {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve;
    reject = innerReject;
  });

  return {
    promise,
    resolve,
    reject,
  };
}
