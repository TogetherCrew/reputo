import type { DataSource } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { syncEvmAssetTransferWithAdapter } from '../../src/adapters/evm/transfers/sync.js';
import { closeTestDb, createTestDb, hasContainerRuntime } from '../utils/db-helpers.js';
import { createMockAlchemyAssetTransfer, FET_ETHEREUM_IDENTIFIER } from '../utils/mock-helpers.js';

const describePostgres = hasContainerRuntime ? describe : describe.skip;

describePostgres('EVM raw sync flow', () => {
  let db: DataSource;

  beforeEach(async () => {
    db = await createTestDb();
  });

  afterEach(async () => {
    await closeTestDb(db);
  });

  it('bootstraps the PostgreSQL schema on database creation', async () => {
    const result = await db.query<{ table_name: string }>(
      `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN ('evm_asset_transfers', 'evm_asset_transfer_sync_state')
        ORDER BY table_name
      `,
    );

    expect(result).toEqual([{ table_name: 'evm_asset_transfer_sync_state' }, { table_name: 'evm_asset_transfers' }]);
  });

  it('syncs raw asset transfers into PostgreSQL', async () => {
    const chain = 'ethereum';
    const assetIdentifier = FET_ETHEREUM_IDENTIFIER;
    const firstTransfer = createMockAlchemyAssetTransfer({
      uniqueId: '0xfirst:log:0x0',
      blockNum: '0x100',
    });
    const secondTransfer = createMockAlchemyAssetTransfer({
      uniqueId: '0xsecond:log:0x1',
      blockNum: '0x101',
      from: '0xAAAA000000000000000000000000000000000001',
      value: null,
    });
    const adapter = {
      getFinalizedBlock: vi.fn().mockResolvedValue('0x101'),
      fetchAssetTransfers: vi.fn(async function* fetchAssetTransfers() {
        yield {
          items: [firstTransfer, secondTransfer],
          lastBlock: '0x101',
        };
      }),
    };

    const transferResult = await syncEvmAssetTransferWithAdapter({
      db,
      chain,
      assetIdentifier,
      adapter,
      clock: () => new Date('2024-01-15T12:00:00.000Z'),
    });

    expect(transferResult).toEqual({
      chain,
      assetIdentifier,
      fromBlock: '0x0',
      toBlock: '0x101',
      pageCount: 1,
      attemptedCount: 2,
      insertedCount: 2,
      ignoredCount: 0,
    });

    const transferRows = await db.query<{
      block_num: string;
      from_address: string;
      value: number | null;
      raw_json: unknown;
    }>(
      `
        SELECT block_num, from_address, value, raw_json
        FROM evm_asset_transfers
        ORDER BY unique_id
      `,
    );

    expect(transferRows).toEqual([
      {
        block_num: '0x100',
        from_address: firstTransfer.from,
        value: 100,
        raw_json: firstTransfer,
      },
      {
        block_num: '0x101',
        from_address: secondTransfer.from,
        value: null,
        raw_json: secondTransfer,
      },
    ]);

    const syncStateRows = await db.query<{
      last_synced_block: string;
      updated_at: Date;
    }>('SELECT last_synced_block, updated_at FROM evm_asset_transfer_sync_state');

    expect(syncStateRows).toEqual([
      {
        last_synced_block: '0x101',
        updated_at: new Date('2024-01-15T12:00:00.000Z'),
      },
    ]);
  });

  it('resumes from sync state and ignores duplicate transfer rows on rerun', async () => {
    const chain = 'ethereum';
    const assetIdentifier = FET_ETHEREUM_IDENTIFIER;
    const firstTransfer = createMockAlchemyAssetTransfer({
      uniqueId: '0xdup:log:0x0',
      blockNum: '0x100',
      hash: '0xdup',
    });
    const secondTransfer = createMockAlchemyAssetTransfer({
      uniqueId: '0xnew:log:0x1',
      blockNum: '0x200',
      hash: '0xnew',
    });

    const firstAdapter = {
      getFinalizedBlock: vi.fn().mockResolvedValue('0x100'),
      fetchAssetTransfers: vi.fn(async function* fetchAssetTransfers() {
        yield {
          items: [firstTransfer],
          lastBlock: '0x100',
        };
      }),
    };

    await syncEvmAssetTransferWithAdapter({
      db,
      chain,
      assetIdentifier,
      adapter: firstAdapter,
    });

    const secondAdapter = {
      getFinalizedBlock: vi.fn().mockResolvedValue('0x200'),
      fetchAssetTransfers: vi.fn(async function* fetchAssetTransfers() {
        yield {
          items: [firstTransfer, secondTransfer],
          lastBlock: '0x200',
        };
      }),
    };

    const result = await syncEvmAssetTransferWithAdapter({
      db,
      chain,
      assetIdentifier,
      adapter: secondAdapter,
    });

    expect(result).toEqual({
      chain,
      assetIdentifier,
      fromBlock: '0x100',
      toBlock: '0x200',
      pageCount: 1,
      attemptedCount: 2,
      insertedCount: 1,
      ignoredCount: 1,
    });
    expect(secondAdapter.fetchAssetTransfers).toHaveBeenCalledWith({
      chain,
      assetIdentifier,
      fromBlock: '0x100',
      toBlock: '0x200',
    });

    const transferRows = await db.query<{ unique_id: string }>(
      `
        SELECT unique_id
        FROM evm_asset_transfers
        ORDER BY unique_id
      `,
    );

    expect(transferRows).toEqual([{ unique_id: '0xdup:log:0x0' }, { unique_id: '0xnew:log:0x1' }]);
  });

  it('persists multi-page syncs in 10-page batches and keeps the final sync state', async () => {
    const chain = 'ethereum';
    const assetIdentifier = FET_ETHEREUM_IDENTIFIER;
    const pages = Array.from({ length: 11 }, (_, index) => {
      const blockNum = `0x${(0x300 + index).toString(16).toUpperCase()}`;
      const transfer = createMockAlchemyAssetTransfer({
        uniqueId: `0xmulti:${index}:0x0`,
        blockNum,
        hash: `0xmulti-${index}`,
      });

      return {
        items: [transfer],
        lastBlock: blockNum,
      };
    });
    const adapter = {
      getFinalizedBlock: vi.fn().mockResolvedValue('0x30A'),
      fetchAssetTransfers: vi.fn(async function* fetchAssetTransfers() {
        yield* pages;
      }),
    };

    const result = await syncEvmAssetTransferWithAdapter({
      db,
      chain,
      assetIdentifier,
      adapter,
      clock: () => new Date('2024-01-15T12:00:00.000Z'),
    });

    expect(result).toEqual({
      chain,
      assetIdentifier,
      fromBlock: '0x0',
      toBlock: '0x30A',
      pageCount: 11,
      attemptedCount: 11,
      insertedCount: 11,
      ignoredCount: 0,
    });

    const transferRows = await db.query<{ unique_id: string; block_num: string }>(
      `
        SELECT unique_id, block_num
        FROM evm_asset_transfers
        WHERE chain = $1 AND asset_identifier = $2
        ORDER BY unique_id
      `,
      [chain, assetIdentifier],
    );

    expect(transferRows).toHaveLength(11);
    expect(transferRows.at(-1)).toEqual({
      unique_id: '0xmulti:9:0x0',
      block_num: '0x309',
    });

    const syncStateRows = await db.query<{ last_synced_block: string }>(
      `
        SELECT last_synced_block
        FROM evm_asset_transfer_sync_state
        WHERE chain = $1 AND asset_identifier = $2
      `,
      [chain, assetIdentifier],
    );

    expect(syncStateRows).toEqual([{ last_synced_block: '0x30A' }]);
  });
});
