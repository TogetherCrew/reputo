import { describe, expect, it, vi } from 'vitest';
import { createPostgresAssetTransferSyncStore } from '../../../src/db/postgres-asset-transfer-sync-store.js';
import type { AssetTransferEntity } from '../../../src/db/schema.js';

describe('Postgres sync store', () => {
  it('uses one bulk insert statement per flush and reports ignored conflicts', async () => {
    const items = Array.from({ length: 10_000 }, (_, index) => createTransfer(index));
    const query = vi.fn(async (queryText: string) => {
      if (queryText.includes('FROM unnest')) {
        return {
          rows: [
            {
              attempted_count: `${items.length}`,
              inserted_count: `${items.length - 12}`,
            },
          ],
        };
      }

      return { rows: [] };
    });

    const store = await createPostgresAssetTransferSyncStore({
      client: {
        connect: vi.fn().mockResolvedValue(undefined),
        end: vi.fn().mockResolvedValue(undefined),
        query,
      },
    });

    const result = await store.withTransaction(async (tx) => {
      const insertMetrics = await tx.insertTransferBatch(items);
      await tx.upsertSyncState({
        chain: 'ethereum',
        assetIdentifier: '0xasset',
        lastSyncedBlock: '0x123',
        lastTransactionHash: '0xabc',
        lastLogIndex: 9_999,
        updatedAt: '2024-01-15T12:00:00.000Z',
      });
      return insertMetrics;
    });

    const bulkInsertCalls = query.mock.calls.filter(([queryText]) => queryText.includes('FROM unnest'));
    expect(bulkInsertCalls).toHaveLength(1);
    expect(bulkInsertCalls[0]?.[1]?.[0]).toHaveLength(10_000);
    expect(query.mock.calls).toHaveLength(4);
    expect(result).toEqual({
      attemptedCount: 10_000,
      insertedCount: 9_988,
      ignoredCount: 12,
    });

    await store.close();
  });

  it('parses sync state rows returned by pg', async () => {
    const store = await createPostgresAssetTransferSyncStore({
      client: {
        connect: vi.fn().mockResolvedValue(undefined),
        end: vi.fn().mockResolvedValue(undefined),
        query: vi.fn().mockResolvedValue({
          rows: [
            {
              chain: 'ethereum',
              asset_identifier: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
              last_synced_block: '18000000',
              last_transaction_hash: '0xsync',
              last_log_index: '7',
              updated_at_unix: '1705320000',
            },
          ],
        }),
      },
    });

    const result = await store.findByAssetKey('fet_ethereum');

    expect(result).toEqual({
      chain: 'ethereum',
      assetIdentifier: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
      lastSyncedBlock: '0x112a880',
      lastTransactionHash: '0xsync',
      lastLogIndex: 7,
      updatedAt: '2024-01-15T12:00:00.000Z',
    });

    await store.close();
  });

  it('rolls back the transaction when the callback fails', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const store = await createPostgresAssetTransferSyncStore({
      client: {
        connect: vi.fn().mockResolvedValue(undefined),
        end: vi.fn().mockResolvedValue(undefined),
        query,
      },
    });

    await expect(
      store.withTransaction(async () => {
        throw new Error('write failed');
      }),
    ).rejects.toThrow('write failed');

    expect(query.mock.calls[0]?.[0]).toBe('BEGIN');
    expect(query.mock.calls[1]?.[0]).toBe('ROLLBACK');

    await store.close();
  });
});

function createTransfer(index: number): AssetTransferEntity {
  return {
    asset_key: 'fet_ethereum',
    block_number: 18_000_000 + index,
    transaction_hash: `0xhash${index}`,
    log_index: index,
    from_address: index % 2 === 0 ? `0xfrom${index}` : null,
    to_address: index % 2 === 0 ? `0xto${index}` : null,
    amount: `${index + 1}`,
    block_timestamp_unix: 1_705_320_000 + index,
  };
}
