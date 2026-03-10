import type BetterSqlite3 from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TokenTransferRepository } from '../../../src/db/repos/token-transfer-repo.js';
import { createTokenTransferRepository } from '../../../src/db/repos/token-transfer-repo.js';
import type { TokenTransferSyncStateRepository } from '../../../src/db/repos/token-transfer-sync-state-repo.js';
import { createTokenTransferSyncStateRepository } from '../../../src/db/repos/token-transfer-sync-state-repo.js';
import type { Database } from '../../../src/db/sqlite.js';
import type { AlchemyEthereumTokenTransferProvider } from '../../../src/providers/ethereum/alchemy-ethereum-token-transfer-provider.js';
import { DefaultSyncTokenTransfersService } from '../../../src/services/sync-token-transfers-service.js';
import { SupportedTokenChain, TOKEN_CHAIN_METADATA, TOKEN_TRANSFER_START_BLOCKS } from '../../../src/shared/index.js';
import { closeTestDatabase, createTestDatabase } from '../../utils/db-helpers.js';
import { createMockAlchemyTransfer } from '../../utils/mock-helpers.js';

function createMockDatabase(sqlite: BetterSqlite3.Database): Database {
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

function createMockProvider(
  overrides?: Partial<AlchemyEthereumTokenTransferProvider>,
): AlchemyEthereumTokenTransferProvider {
  return {
    getToBlock: vi.fn().mockResolvedValue(8000000),
    fetchTokenTransfers: overrides?.fetchTokenTransfers ?? async function* () {},
    ...overrides,
  };
}

describe('DefaultSyncTokenTransfersService', () => {
  let sqliteDb: BetterSqlite3.Database;
  let db: Database;
  let transferRepo: TokenTransferRepository;
  let syncStateRepo: TokenTransferSyncStateRepository;
  const fixedClock = () => '2024-01-15T12:00:00.000Z';

  beforeEach(() => {
    sqliteDb = createTestDatabase();
    db = createMockDatabase(sqliteDb);
    transferRepo = createTokenTransferRepository(sqliteDb);
    syncStateRepo = createTokenTransferSyncStateRepository(sqliteDb);
  });

  afterEach(() => {
    closeTestDatabase(sqliteDb);
  });

  it('resolves package metadata from tokenChain', async () => {
    const metadata = TOKEN_CHAIN_METADATA[SupportedTokenChain.FET_ETHEREUM];
    const provider = createMockProvider();

    const service = new DefaultSyncTokenTransfersService(
      SupportedTokenChain.FET_ETHEREUM,
      db,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );

    const result = await service.sync();
    expect(result.tokenChain).toBe(SupportedTokenChain.FET_ETHEREUM);

    expect(provider.getToBlock).toHaveBeenCalled();
    expect(result.fromBlock).toBe(metadata.startBlock);
  });

  it('first sync starts from package-owned startBlock', async () => {
    const provider = createMockProvider();

    const service = new DefaultSyncTokenTransfersService(
      SupportedTokenChain.FET_ETHEREUM,
      db,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );

    const result = await service.sync();
    expect(result.fromBlock).toBe(TOKEN_TRANSFER_START_BLOCKS[SupportedTokenChain.FET_ETHEREUM]);
  });

  it('later sync starts from lastSyncedBlock + 1', async () => {
    syncStateRepo.upsert({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      lastSyncedBlock: 7500000,
      updatedAt: '2024-01-14T10:00:00.000Z',
    });

    const provider = createMockProvider();

    const service = new DefaultSyncTokenTransfersService(
      SupportedTokenChain.FET_ETHEREUM,
      db,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );

    const result = await service.sync();
    expect(result.fromBlock).toBe(7500001);
  });

  it('provider getToBlock() value is used as sync upper bound', async () => {
    const provider = createMockProvider({
      getToBlock: vi.fn().mockResolvedValue(9999999),
    });

    const service = new DefaultSyncTokenTransfersService(
      SupportedTokenChain.FET_ETHEREUM,
      db,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );

    const result = await service.sync();
    expect(result.toBlock).toBe(9999999);
  });

  it('returns zero insertedCount when fromBlock > toBlock', async () => {
    syncStateRepo.upsert({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      lastSyncedBlock: 9000000,
      updatedAt: '2024-01-14T10:00:00.000Z',
    });

    const provider = createMockProvider({
      getToBlock: vi.fn().mockResolvedValue(8000000),
    });

    const service = new DefaultSyncTokenTransfersService(
      SupportedTokenChain.FET_ETHEREUM,
      db,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );

    const result = await service.sync();
    expect(result.insertedCount).toBe(0);
    expect(result.fromBlock).toBe(9000001);
    expect(result.toBlock).toBe(8000000);
  });

  it('inserts transfers and updates sync state per batch', async () => {
    const transfers = [
      createMockAlchemyTransfer({
        blockNum: '0x6e9875',
        uniqueId: '0xaaa:log:0x0',
        hash: '0xaaa',
        from: '0x1111111111111111111111111111111111111111',
        to: '0x2222222222222222222222222222222222222222',
        value: 50,
      }),
      createMockAlchemyTransfer({
        blockNum: '0x6e9876',
        uniqueId: '0xbbb:log:0x0',
        hash: '0xbbb',
        from: '0x3333333333333333333333333333333333333333',
        to: '0x4444444444444444444444444444444444444444',
        value: 75,
      }),
    ];

    async function* mockFetch() {
      yield { items: transfers, lastBlock: 7280000 };
    }

    const provider = createMockProvider({
      getToBlock: vi.fn().mockResolvedValue(7280000),
      fetchTokenTransfers: mockFetch,
    });

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
    expect(syncState?.lastSyncedBlock).toBe(7280000);
  });

  it('duplicate transfer rows are ignored', async () => {
    const transfer = createMockAlchemyTransfer({
      blockNum: '0x6e9875',
      uniqueId: '0xdup:log:0x0',
      hash: '0xdup',
    });

    async function* mockFetch() {
      yield { items: [transfer, transfer], lastBlock: 7280000 };
    }

    const provider = createMockProvider({
      getToBlock: vi.fn().mockResolvedValue(7280000),
      fetchTokenTransfers: mockFetch,
    });

    const service = new DefaultSyncTokenTransfersService(
      SupportedTokenChain.FET_ETHEREUM,
      db,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );

    const result = await service.sync();
    expect(result.insertedCount).toBe(1);
  });

  it('handles multiple batches correctly', async () => {
    async function* mockFetch() {
      yield {
        items: [
          createMockAlchemyTransfer({
            blockNum: '0x6e9875',
            uniqueId: '0xfirst:log:0x0',
            hash: '0xfirst',
          }),
        ],
        lastBlock: 7270000,
      };
      yield {
        items: [
          createMockAlchemyTransfer({
            blockNum: '0x6f4241',
            uniqueId: '0xsecond:log:0x0',
            hash: '0xsecond',
          }),
        ],
        lastBlock: 7280000,
      };
    }

    const provider = createMockProvider({
      getToBlock: vi.fn().mockResolvedValue(7280000),
      fetchTokenTransfers: mockFetch,
    });

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
    expect(syncState?.lastSyncedBlock).toBe(7280000);
  });
});
