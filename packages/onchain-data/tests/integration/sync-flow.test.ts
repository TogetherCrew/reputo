import type BetterSqlite3 from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TokenTransferRepository } from '../../src/db/repos/token-transfer-repo.js';
import { createTokenTransferRepository } from '../../src/db/repos/token-transfer-repo.js';
import type { TokenTransferSyncStateRepository } from '../../src/db/repos/token-transfer-sync-state-repo.js';
import { createTokenTransferSyncStateRepository } from '../../src/db/repos/token-transfer-sync-state-repo.js';
import type { Database } from '../../src/db/sqlite.js';
import type { AlchemyEthereumTokenTransferProvider } from '../../src/providers/ethereum/alchemy-ethereum-token-transfer-provider.js';
import type { AlchemyAssetTransfer } from '../../src/providers/ethereum/alchemy-types.js';
import { DefaultSyncTokenTransfersService } from '../../src/services/sync-token-transfers-service.js';
import { SupportedTokenChain, TransferDirection } from '../../src/shared/index.js';
import { closeTestDatabase, createTestDatabase } from '../utils/db-helpers.js';
import { createMockAlchemyTransfer } from '../utils/mock-helpers.js';

function createInMemoryDatabase(sqlite: BetterSqlite3.Database): Database {
  return {
    sqlite,
    transaction<T>(fn: () => T): T {
      return sqlite.transaction(fn)();
    },
    close() {
      sqlite.close();
    },
  };
}

describe('Sync Flow Integration', () => {
  let sqliteDb: BetterSqlite3.Database;
  let db: Database;
  let transferRepo: TokenTransferRepository;
  let syncStateRepo: TokenTransferSyncStateRepository;
  const fixedClock = () => '2024-01-15T12:00:00.000Z';

  beforeEach(() => {
    sqliteDb = createTestDatabase();
    db = createInMemoryDatabase(sqliteDb);
    transferRepo = createTokenTransferRepository(sqliteDb);
    syncStateRepo = createTokenTransferSyncStateRepository(sqliteDb);
  });

  afterEach(() => {
    closeTestDatabase(sqliteDb);
  });

  function makeProvider(
    toBlock: number,
    batchesFn: () => AsyncGenerator<{ items: AlchemyAssetTransfer[]; lastBlock: number }>,
  ): AlchemyEthereumTokenTransferProvider {
    return {
      getToBlock: vi.fn().mockResolvedValue(toBlock),
      fetchTokenTransfers: batchesFn,
    };
  }

  it('first sync writes transfers and creates sync state', async () => {
    const transfers = [
      createMockAlchemyTransfer({
        blockNum: '0x6e9875',
        uniqueId: '0xaaa:log:0x0',
        hash: '0xaaa',
        from: '0x1111111111111111111111111111111111111111',
        to: '0x2222222222222222222222222222222222222222',
        value: 100,
      }),
      createMockAlchemyTransfer({
        blockNum: '0x6e9876',
        uniqueId: '0xbbb:log:0x1',
        hash: '0xbbb',
        from: '0x3333333333333333333333333333333333333333',
        to: '0x2222222222222222222222222222222222222222',
        value: 200,
      }),
    ];

    async function* batches() {
      yield { items: transfers, lastBlock: 7280000 };
    }

    const provider = makeProvider(7280000, batches);
    const service = new DefaultSyncTokenTransfersService(
      SupportedTokenChain.FET_ETHEREUM,
      db,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );

    const result = await service.sync();
    expect(result.insertedCount).toBe(2);

    const syncState = syncStateRepo.findByTokenChain(SupportedTokenChain.FET_ETHEREUM);
    expect(syncState).not.toBeNull();
    expect(syncState?.lastSyncedBlock).toBe(7280000);
  });

  it('second sync only fetches new blocks', async () => {
    syncStateRepo.upsert({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      lastSyncedBlock: 7280000,
      updatedAt: '2024-01-14T00:00:00.000Z',
    });

    const fetchFn = vi.fn();
    async function* batches() {
      fetchFn();
      yield {
        items: [
          createMockAlchemyTransfer({
            blockNum: '0x6f4241',
            uniqueId: '0xccc:log:0x0',
            hash: '0xccc',
          }),
        ],
        lastBlock: 7300000,
      };
    }

    const provider = makeProvider(7300000, batches);
    const service = new DefaultSyncTokenTransfersService(
      SupportedTokenChain.FET_ETHEREUM,
      db,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );

    const result = await service.sync();
    expect(result.fromBlock).toBe(7280001);
    expect(result.toBlock).toBe(7300000);
    expect(result.insertedCount).toBe(1);
  });

  it('failure inside a batch does not update sync state beyond committed data', async () => {
    const transfer1 = createMockAlchemyTransfer({
      blockNum: '0x6e9875',
      uniqueId: '0xfirst:log:0x0',
      hash: '0xfirst',
    });

    let batchIndex = 0;
    async function* batches() {
      yield { items: [transfer1], lastBlock: 7270000 };
      batchIndex++;
      throw new Error('Provider failure on second batch');
    }

    const provider = makeProvider(7280000, batches);
    const service = new DefaultSyncTokenTransfersService(
      SupportedTokenChain.FET_ETHEREUM,
      db,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );

    await expect(service.sync()).rejects.toThrow('Provider failure');

    const syncState = syncStateRepo.findByTokenChain(SupportedTokenChain.FET_ETHEREUM);
    expect(syncState?.lastSyncedBlock).toBe(7270000);
    expect(batchIndex).toBe(1);
  });

  it('copied database can be queried by address with block range and direction', async () => {
    const addr = '0xaaaa000000000000000000000000000000000001';
    const other = '0xbbbb000000000000000000000000000000000002';

    // 0x6ecf30 = 7262000, 0x6ecf31 = 7262001, 0x6ecf32 = 7262002
    const transfers = [
      createMockAlchemyTransfer({
        blockNum: '0x6ecf30',
        uniqueId: '0xout1:log:0x0',
        hash: '0xout1',
        from: addr,
        to: other,
        value: 10,
      }),
      createMockAlchemyTransfer({
        blockNum: '0x6ecf31',
        uniqueId: '0xin1:log:0x0',
        hash: '0xin1',
        from: other,
        to: addr,
        value: 20,
      }),
      createMockAlchemyTransfer({
        blockNum: '0x6ecf32',
        uniqueId: '0xout2:log:0x0',
        hash: '0xout2',
        from: addr,
        to: other,
        value: 30,
      }),
    ];

    async function* batches() {
      yield { items: transfers, lastBlock: 7280000 };
    }

    const provider = makeProvider(7280000, batches);
    const service = new DefaultSyncTokenTransfersService(
      SupportedTokenChain.FET_ETHEREUM,
      db,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );
    await service.sync();

    const all = transferRepo.findByAddress({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      address: addr,
    });
    expect(all).toHaveLength(3);

    const inbound = transferRepo.findByAddress({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      address: addr,
      direction: TransferDirection.INBOUND,
    });
    expect(inbound).toHaveLength(1);
    expect(inbound[0].transactionHash).toBe('0xin1');

    const outbound = transferRepo.findByAddress({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      address: addr,
      direction: TransferDirection.OUTBOUND,
    });
    expect(outbound).toHaveLength(2);

    const rangeFiltered = transferRepo.findByAddress({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      address: addr,
      fromBlock: 7262000,
      toBlock: 7262001,
    });
    expect(rangeFiltered).toHaveLength(2);

    const noResults = transferRepo.findByAddress({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      address: addr,
      fromBlock: 9000000,
      toBlock: 9999999,
    });
    expect(noResults).toHaveLength(0);
  });
});
