import type { DataSource, EntityManager } from 'typeorm';
import { describe, expect, it, vi } from 'vitest';

import {
  EvmAssetTransferSyncStateEntitySchema,
  type EvmAssetTransferSyncStateRow,
} from '../../../../../src/adapters/evm/sync-state/schema.js';
import {
  EvmAssetTransferEntitySchema,
  type EvmAssetTransferRow,
} from '../../../../../src/adapters/evm/transfers/schema.js';
import { syncEvmAssetTransferWithAdapter } from '../../../../../src/adapters/evm/transfers/sync.js';
import { createMockAlchemyAssetTransfer, FET_ETHEREUM_IDENTIFIER } from '../../../../utils/mock-helpers.js';

describe('syncEvmAssetTransferWithAdapter', () => {
  it('stores raw transfer fields as-is and updates sync state', async () => {
    const chain = 'ethereum';
    const assetIdentifier = FET_ETHEREUM_IDENTIFIER;
    const transfer = createMockAlchemyAssetTransfer({
      blockNum: '0xABCDEF',
      from: '0xAAAA000000000000000000000000000000000001',
      metadata: {
        blockTimestamp: '2024-01-15T10:30:00.000Z',
      },
    });
    const adapter = {
      getFinalizedBlock: vi.fn().mockResolvedValue('0xABCDEF'),
      fetchAssetTransfers: vi.fn(async function* fetchAssetTransfers() {
        yield {
          items: [transfer],
          lastBlock: '0xABCDEF',
        };
      }),
    };
    const mockDb = createMockTransferSyncDb();

    const result = await syncEvmAssetTransferWithAdapter({
      db: mockDb.db,
      chain,
      assetIdentifier,
      adapter,
      clock: () => new Date('2024-01-15T12:00:00.000Z'),
    });

    expect(result).toEqual({
      chain,
      assetIdentifier,
      fromBlock: '0x0',
      toBlock: '0xABCDEF',
      pageCount: 1,
      attemptedCount: 1,
      insertedCount: 1,
      ignoredCount: 0,
    });
    expect(adapter.fetchAssetTransfers).toHaveBeenCalledWith({
      chain,
      assetIdentifier,
      fromBlock: '0x0',
      toBlock: '0xABCDEF',
    });
    expect(mockDb.insertValues[0]).toEqual([
      {
        chain,
        asset_identifier: assetIdentifier,
        block_num: transfer.blockNum,
        unique_id: transfer.uniqueId,
        hash: transfer.hash,
        from_address: transfer.from,
        to_address: transfer.to,
        value: transfer.value,
        asset: transfer.asset,
        category: transfer.category,
        raw_contract: transfer.rawContract,
        metadata: transfer.metadata,
        raw_json: transfer,
      },
    ]);
    expect(mockDb.syncState).toEqual({
      chain,
      asset_identifier: assetIdentifier,
      last_synced_block: '0xABCDEF',
      updated_at: new Date('2024-01-15T12:00:00.000Z'),
    });
  });

  it('resumes from stored sync state and reports ignored duplicates', async () => {
    const chain = 'ethereum';
    const assetIdentifier = FET_ETHEREUM_IDENTIFIER;
    const transfer = createMockAlchemyAssetTransfer({
      uniqueId: '0xduplicate:log:0x0',
    });
    const adapter = {
      getFinalizedBlock: vi.fn().mockResolvedValue('0x200'),
      fetchAssetTransfers: vi.fn(async function* fetchAssetTransfers() {
        yield {
          items: [transfer],
          lastBlock: '0x200',
        };
      }),
    };
    const mockDb = createMockTransferSyncDb({
      syncState: {
        chain,
        asset_identifier: assetIdentifier,
        last_synced_block: '0x150',
        updated_at: new Date('2024-01-14T00:00:00.000Z'),
      },
      insertedCounts: [0],
    });

    const result = await syncEvmAssetTransferWithAdapter({
      db: mockDb.db,
      chain,
      assetIdentifier,
      adapter,
    });

    expect(result.fromBlock).toBe('0x150');
    expect(result.toBlock).toBe('0x200');
    expect(result.attemptedCount).toBe(1);
    expect(result.insertedCount).toBe(0);
    expect(result.ignoredCount).toBe(1);
    expect(adapter.fetchAssetTransfers).toHaveBeenCalledWith({
      chain,
      assetIdentifier,
      fromBlock: '0x150',
      toBlock: '0x200',
    });
  });

  it('batches 10 fetched pages into a single insert and sync-state write', async () => {
    const chain = 'ethereum';
    const assetIdentifier = FET_ETHEREUM_IDENTIFIER;
    const pages = Array.from({ length: 10 }, (_, index) => ({
      items: [
        createMockAlchemyAssetTransfer({
          uniqueId: `0xbatch:${index}:0x0`,
          blockNum: `0x${(0x100 + index).toString(16).toUpperCase()}`,
        }),
      ],
      lastBlock: `0x${(0x100 + index).toString(16).toUpperCase()}`,
    }));
    const adapter = {
      getFinalizedBlock: vi.fn().mockResolvedValue('0x109'),
      fetchAssetTransfers: vi.fn(async function* fetchAssetTransfers() {
        yield* pages;
      }),
    };
    const mockDb = createMockTransferSyncDb();

    const result = await syncEvmAssetTransferWithAdapter({
      db: mockDb.db,
      chain,
      assetIdentifier,
      adapter,
      clock: () => new Date('2024-01-15T12:00:00.000Z'),
    });

    expect(result.pageCount).toBe(10);
    expect(result.attemptedCount).toBe(10);
    expect(result.insertedCount).toBe(10);
    expect(result.ignoredCount).toBe(0);
    expect(mockDb.insertValues).toHaveLength(1);
    expect(mockDb.insertValues[0]).toHaveLength(10);
    expect(mockDb.syncStateUpsertCount).toBe(1);
    expect(mockDb.syncState?.last_synced_block).toBe('0x109');
  });

  it('flushes a final partial batch after the first 10 pages', async () => {
    const chain = 'ethereum';
    const assetIdentifier = FET_ETHEREUM_IDENTIFIER;
    const pages = Array.from({ length: 11 }, (_, index) => ({
      items: [
        createMockAlchemyAssetTransfer({
          uniqueId: `0xpartial:${index}:0x0`,
          blockNum: `0x${(0x200 + index).toString(16).toUpperCase()}`,
        }),
      ],
      lastBlock: `0x${(0x200 + index).toString(16).toUpperCase()}`,
    }));
    const adapter = {
      getFinalizedBlock: vi.fn().mockResolvedValue('0x20A'),
      fetchAssetTransfers: vi.fn(async function* fetchAssetTransfers() {
        yield* pages;
      }),
    };
    const mockDb = createMockTransferSyncDb();

    const result = await syncEvmAssetTransferWithAdapter({
      db: mockDb.db,
      chain,
      assetIdentifier,
      adapter,
      clock: () => new Date('2024-01-15T12:00:00.000Z'),
    });

    expect(result.pageCount).toBe(11);
    expect(result.attemptedCount).toBe(11);
    expect(result.insertedCount).toBe(11);
    expect(result.ignoredCount).toBe(0);
    expect(mockDb.insertValues).toHaveLength(2);
    expect(mockDb.insertValues[0]).toHaveLength(10);
    expect(mockDb.insertValues[1]).toHaveLength(1);
    expect(mockDb.syncStateUpsertCount).toBe(2);
    expect(mockDb.syncState?.last_synced_block).toBe('0x20A');
  });
});

function createMockTransferSyncDb(input?: { syncState?: EvmAssetTransferSyncStateRow; insertedCounts?: number[] }) {
  const insertValues: EvmAssetTransferRow[][] = [];
  const insertedCounts = [...(input?.insertedCounts ?? [])];
  let syncState = input?.syncState ?? null;
  let syncStateUpsertCount = 0;
  let insertedRows: EvmAssetTransferRow[] = [];

  const insertQueryBuilder = {
    insert: vi.fn().mockReturnThis(),
    into: vi.fn().mockReturnThis(),
    values: vi.fn().mockImplementation((rows: EvmAssetTransferRow[]) => {
      insertedRows = rows;
      return insertQueryBuilder;
    }),
    orIgnore: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    execute: vi.fn().mockImplementation(async () => {
      insertValues.push(insertedRows);
      const insertedCount = insertedCounts.shift() ?? insertedRows.length;

      return {
        raw: Array.from({ length: insertedCount }, () => ({ inserted: 1 })),
      };
    }),
  };

  const transferRepository = {
    createQueryBuilder: vi.fn().mockReturnValue(insertQueryBuilder),
  };

  const syncStateReadRepository = {
    findOneBy: vi.fn().mockImplementation(async () => syncState),
  };

  const syncStateWriteRepository = {
    upsert: vi.fn().mockImplementation(async (row: EvmAssetTransferSyncStateRow) => {
      syncStateUpsertCount += 1;
      syncState = row;
    }),
  };

  const txManager = {
    getRepository: vi.fn().mockImplementation((schema: unknown) => {
      if (schema === EvmAssetTransferEntitySchema) {
        return transferRepository;
      }

      if (schema === EvmAssetTransferSyncStateEntitySchema) {
        return syncStateWriteRepository;
      }

      throw new Error(`Unexpected transaction repository: ${String(schema)}`);
    }),
  };

  const manager = {
    getRepository: vi.fn().mockImplementation((schema: unknown) => {
      if (schema === EvmAssetTransferSyncStateEntitySchema) {
        return syncStateReadRepository;
      }

      throw new Error(`Unexpected repository: ${String(schema)}`);
    }),
  };

  const db = {
    manager,
    transaction: vi.fn().mockImplementation(async (callback: (entityManager: EntityManager) => Promise<unknown>) => {
      return callback(txManager as unknown as EntityManager);
    }),
  };

  return {
    db: db as unknown as DataSource,
    insertValues,
    get syncStateUpsertCount() {
      return syncStateUpsertCount;
    },
    get syncState() {
      return syncState;
    },
  };
}
