import type { DataSource, EntityManager } from 'typeorm';
import { describe, expect, it, vi } from 'vitest';
import {
  CardanoAssetTransactionEntitySchema,
  type CardanoAssetTransactionRow,
} from '../../../../../src/adapters/cardano/asset-transactions/schema.js';
import {
  CardanoAssetTransactionSyncStateEntitySchema,
  type CardanoAssetTransactionSyncStateRow,
} from '../../../../../src/adapters/cardano/sync-state/schema.js';
import {
  CardanoTransactionUtxoEntitySchema,
  CardanoTransactionUtxoInputAmountEntitySchema,
  type CardanoTransactionUtxoInputAmountRow,
  CardanoTransactionUtxoInputEntitySchema,
  type CardanoTransactionUtxoInputRow,
  CardanoTransactionUtxoOutputAmountEntitySchema,
  type CardanoTransactionUtxoOutputAmountRow,
  CardanoTransactionUtxoOutputEntitySchema,
  type CardanoTransactionUtxoOutputRow,
  type CardanoTransactionUtxoRow,
} from '../../../../../src/adapters/cardano/transaction-utxos/schema.js';
import { syncCardanoAssetTransferWithAdapter } from '../../../../../src/adapters/cardano/transfers/sync.js';
import {
  createMockBlockfrostAssetTransaction,
  createMockBlockfrostTransactionUtxo,
  FET_CARDANO_IDENTIFIER,
} from '../../../../utils/mock-helpers.js';

describe('syncCardanoAssetTransferWithAdapter', () => {
  it('stores raw asset transactions and normalized utxos on the initial sync', async () => {
    const assetIdentifier = FET_CARDANO_IDENTIFIER;
    const firstTransaction = createMockBlockfrostAssetTransaction({
      tx_hash: 'tx-1',
      tx_index: 1,
      block_height: 100,
      block_time: 1_700_000_100,
    });
    const secondTransaction = createMockBlockfrostAssetTransaction({
      tx_hash: 'tx-2',
      tx_index: 2,
      block_height: 101,
      block_time: 1_700_000_200,
    });
    const firstTransactionUtxo = createMockBlockfrostTransactionUtxo({
      hash: firstTransaction.tx_hash,
      inputs: [
        {
          address: 'addr-input-1',
          amount: [
            {
              unit: 'lovelace',
              quantity: '42000000',
            },
            {
              unit: FET_CARDANO_IDENTIFIER,
              quantity: '12',
            },
          ],
          tx_hash: 'source-tx-1',
          output_index: 0,
          data_hash: null,
          inline_datum: null,
          reference_script_hash: null,
          collateral: false,
        },
        {
          address: 'addr-input-2',
          amount: [
            {
              unit: 'lovelace',
              quantity: '42',
            },
          ],
          tx_hash: 'source-tx-2',
          output_index: 1,
          data_hash: 'input-data-hash',
          inline_datum: 'input-inline-datum',
          reference_script_hash: 'input-script-hash',
          collateral: true,
          reference: false,
        },
      ],
      outputs: [
        {
          address: 'addr-output-1',
          amount: [
            {
              unit: 'lovelace',
              quantity: '21000000',
            },
            {
              unit: FET_CARDANO_IDENTIFIER,
              quantity: '12',
            },
          ],
          output_index: 0,
          data_hash: null,
          inline_datum: null,
          collateral: false,
          reference_script_hash: null,
          consumed_by_tx: null,
        },
        {
          address: 'addr-output-2',
          amount: [
            {
              unit: 'lovelace',
              quantity: '7',
            },
          ],
          output_index: 1,
          data_hash: 'output-data-hash',
          inline_datum: 'output-inline-datum',
          collateral: true,
          reference_script_hash: 'output-script-hash',
          consumed_by_tx: 'tx-consumer',
        },
      ],
    });
    const secondTransactionUtxo = createMockBlockfrostTransactionUtxo({ hash: secondTransaction.tx_hash });
    const adapter = {
      fetchAssetTransactions: vi.fn(async function* fetchAssetTransactions() {
        yield {
          items: [firstTransaction, secondTransaction],
        };
      }),
      fetchTransactionUtxo: vi
        .fn()
        .mockResolvedValueOnce(firstTransactionUtxo)
        .mockResolvedValueOnce(secondTransactionUtxo),
    };
    const mockDb = createMockTransferSyncDb();

    const result = await syncCardanoAssetTransferWithAdapter({
      db: mockDb.db,
      assetIdentifier,
      adapter,
      clock: () => new Date('2024-01-15T12:00:00.000Z'),
    });

    expect(result).toEqual({
      chain: 'cardano',
      assetIdentifier,
      order: 'asc',
      fromTxHash: null,
      toTxHash: 'tx-2',
      pageCount: 1,
      attemptedAssetTransactionCount: 2,
      insertedAssetTransactionCount: 2,
      ignoredAssetTransactionCount: 0,
      attemptedUtxoCount: 2,
      insertedUtxoCount: 2,
      ignoredUtxoCount: 0,
    });
    expect(adapter.fetchAssetTransactions).toHaveBeenCalledWith({
      assetIdentifier,
      order: 'asc',
      fromPage: 1,
    });
    expect(mockDb.assetTransactionInsertValues[0]).toEqual([
      {
        chain: 'cardano',
        asset_identifier: assetIdentifier,
        tx_hash: firstTransaction.tx_hash,
        tx_index: firstTransaction.tx_index,
        block_height: firstTransaction.block_height,
        block_time: firstTransaction.block_time,
        raw_json: firstTransaction,
      },
      {
        chain: 'cardano',
        asset_identifier: assetIdentifier,
        tx_hash: secondTransaction.tx_hash,
        tx_index: secondTransaction.tx_index,
        block_height: secondTransaction.block_height,
        block_time: secondTransaction.block_time,
        raw_json: secondTransaction,
      },
    ]);
    expect(mockDb.transactionUtxoInsertValues[0]).toEqual([
      {
        chain: 'cardano',
        tx_hash: firstTransaction.tx_hash,
        raw_json: firstTransactionUtxo,
      },
      {
        chain: 'cardano',
        tx_hash: secondTransaction.tx_hash,
        raw_json: secondTransactionUtxo,
      },
    ]);
    expect(mockDb.transactionUtxoInputInsertValues[0]).toEqual([
      {
        chain: 'cardano',
        tx_hash: firstTransaction.tx_hash,
        input_index: 0,
        address: 'addr-input-1',
        source_tx_hash: 'source-tx-1',
        source_output_index: 0,
        data_hash: null,
        inline_datum: null,
        reference_script_hash: null,
        collateral: false,
        reference: null,
      },
      {
        chain: 'cardano',
        tx_hash: firstTransaction.tx_hash,
        input_index: 1,
        address: 'addr-input-2',
        source_tx_hash: 'source-tx-2',
        source_output_index: 1,
        data_hash: 'input-data-hash',
        inline_datum: 'input-inline-datum',
        reference_script_hash: 'input-script-hash',
        collateral: true,
        reference: false,
      },
      {
        chain: 'cardano',
        tx_hash: secondTransaction.tx_hash,
        input_index: 0,
        address:
          'addr1q9ld26v2lv8wvrxxmvg90pn8n8n5k6tdst06q2s856rwmvnueldzuuqmnsye359fqrk8hwvenjnqultn7djtrlft7jnq7dy7wv',
        source_tx_hash: '1a0570af966fb355a7160e4f82d5a80b8681b7955f5d44bec0dce628516157f0',
        source_output_index: 0,
        data_hash: null,
        inline_datum: null,
        reference_script_hash: null,
        collateral: false,
        reference: null,
      },
    ]);
    expect(mockDb.transactionUtxoInputAmountInsertValues[0]).toEqual([
      {
        chain: 'cardano',
        tx_hash: firstTransaction.tx_hash,
        input_index: 0,
        amount_index: 0,
        unit: 'lovelace',
        quantity: '42000000',
      },
      {
        chain: 'cardano',
        tx_hash: firstTransaction.tx_hash,
        input_index: 0,
        amount_index: 1,
        unit: FET_CARDANO_IDENTIFIER,
        quantity: '12',
      },
      {
        chain: 'cardano',
        tx_hash: firstTransaction.tx_hash,
        input_index: 1,
        amount_index: 0,
        unit: 'lovelace',
        quantity: '42',
      },
      {
        chain: 'cardano',
        tx_hash: secondTransaction.tx_hash,
        input_index: 0,
        amount_index: 0,
        unit: 'lovelace',
        quantity: '42000000',
      },
      {
        chain: 'cardano',
        tx_hash: secondTransaction.tx_hash,
        input_index: 0,
        amount_index: 1,
        unit: FET_CARDANO_IDENTIFIER,
        quantity: '12',
      },
    ]);
    expect(mockDb.transactionUtxoOutputInsertValues[0]).toEqual([
      {
        chain: 'cardano',
        tx_hash: firstTransaction.tx_hash,
        output_index: 0,
        address: 'addr-output-1',
        data_hash: null,
        inline_datum: null,
        collateral: false,
        reference_script_hash: null,
        consumed_by_tx_hash: null,
      },
      {
        chain: 'cardano',
        tx_hash: firstTransaction.tx_hash,
        output_index: 1,
        address: 'addr-output-2',
        data_hash: 'output-data-hash',
        inline_datum: 'output-inline-datum',
        collateral: true,
        reference_script_hash: 'output-script-hash',
        consumed_by_tx_hash: 'tx-consumer',
      },
      {
        chain: 'cardano',
        tx_hash: secondTransaction.tx_hash,
        output_index: 0,
        address:
          'addr1qyhr4exrgavdcn3qhfcc9f939fzsch2re5ry9cwvcdyh4x4re5df3pzwwmyq946axfcejy5n4x0y99wqpgtp2gd0k09qdpvhza',
        data_hash: null,
        inline_datum: null,
        collateral: false,
        reference_script_hash: null,
        consumed_by_tx_hash: null,
      },
    ]);
    expect(mockDb.transactionUtxoOutputAmountInsertValues[0]).toEqual([
      {
        chain: 'cardano',
        tx_hash: firstTransaction.tx_hash,
        output_index: 0,
        amount_index: 0,
        unit: 'lovelace',
        quantity: '21000000',
      },
      {
        chain: 'cardano',
        tx_hash: firstTransaction.tx_hash,
        output_index: 0,
        amount_index: 1,
        unit: FET_CARDANO_IDENTIFIER,
        quantity: '12',
      },
      {
        chain: 'cardano',
        tx_hash: firstTransaction.tx_hash,
        output_index: 1,
        amount_index: 0,
        unit: 'lovelace',
        quantity: '7',
      },
      {
        chain: 'cardano',
        tx_hash: secondTransaction.tx_hash,
        output_index: 0,
        amount_index: 0,
        unit: 'lovelace',
        quantity: '21000000',
      },
      {
        chain: 'cardano',
        tx_hash: secondTransaction.tx_hash,
        output_index: 0,
        amount_index: 1,
        unit: FET_CARDANO_IDENTIFIER,
        quantity: '12',
      },
    ]);
    expect(mockDb.syncState).toEqual({
      chain: 'cardano',
      asset_identifier: assetIdentifier,
      last_tx_hash: 'tx-2',
      last_tx_index: 2,
      last_block_height: 101,
      last_block_time: 1_700_000_200,
      last_synced_page: 1,
      last_asset_transaction_raw_json: secondTransaction,
      updated_at: new Date('2024-01-15T12:00:00.000Z'),
    });
  });

  it('resumes in ascending order from the stored page', async () => {
    const assetIdentifier = FET_CARDANO_IDENTIFIER;
    const storedTransaction = createMockBlockfrostAssetTransaction({
      tx_hash: 'tx-known',
      tx_index: 4,
      block_height: 200,
      block_time: 1_700_000_400,
    });
    const newestTransaction = createMockBlockfrostAssetTransaction({
      tx_hash: 'tx-new',
      tx_index: 5,
      block_height: 201,
      block_time: 1_700_000_500,
    });
    const adapter = {
      fetchAssetTransactions: vi.fn(async function* fetchAssetTransactions() {
        yield {
          items: [storedTransaction, newestTransaction],
        };
      }),
      fetchTransactionUtxo: vi
        .fn()
        .mockResolvedValue(createMockBlockfrostTransactionUtxo({ hash: newestTransaction.tx_hash })),
    };
    const mockDb = createMockTransferSyncDb({
      syncState: {
        chain: 'cardano',
        asset_identifier: assetIdentifier,
        last_tx_hash: storedTransaction.tx_hash,
        last_tx_index: storedTransaction.tx_index,
        last_block_height: storedTransaction.block_height,
        last_block_time: storedTransaction.block_time,
        last_synced_page: 3,
        last_asset_transaction_raw_json: storedTransaction,
        updated_at: new Date('2024-01-14T00:00:00.000Z'),
      },
    });

    const result = await syncCardanoAssetTransferWithAdapter({
      db: mockDb.db,
      assetIdentifier,
      adapter,
      clock: () => new Date('2024-01-15T12:00:00.000Z'),
    });

    expect(result).toEqual({
      chain: 'cardano',
      assetIdentifier,
      order: 'asc',
      fromTxHash: storedTransaction.tx_hash,
      toTxHash: newestTransaction.tx_hash,
      pageCount: 1,
      attemptedAssetTransactionCount: 1,
      insertedAssetTransactionCount: 1,
      ignoredAssetTransactionCount: 0,
      attemptedUtxoCount: 1,
      insertedUtxoCount: 1,
      ignoredUtxoCount: 0,
    });
    expect(adapter.fetchAssetTransactions).toHaveBeenCalledWith({
      assetIdentifier,
      order: 'asc',
      fromPage: 3,
    });
    expect(adapter.fetchTransactionUtxo).toHaveBeenCalledTimes(1);
    expect(adapter.fetchTransactionUtxo).toHaveBeenCalledWith(newestTransaction.tx_hash);
    expect(mockDb.syncState).toEqual({
      chain: 'cardano',
      asset_identifier: assetIdentifier,
      last_tx_hash: newestTransaction.tx_hash,
      last_tx_index: newestTransaction.tx_index,
      last_block_height: newestTransaction.block_height,
      last_block_time: newestTransaction.block_time,
      last_synced_page: 3,
      last_asset_transaction_raw_json: newestTransaction,
      updated_at: new Date('2024-01-15T12:00:00.000Z'),
    });
  });

  it('fails fast when the stored page does not contain the sync boundary transaction', async () => {
    const assetIdentifier = FET_CARDANO_IDENTIFIER;
    const storedTransaction = createMockBlockfrostAssetTransaction({
      tx_hash: 'tx-known',
      tx_index: 4,
      block_height: 200,
      block_time: 1_700_000_400,
    });
    const unexpectedTransaction = createMockBlockfrostAssetTransaction({
      tx_hash: 'tx-other',
      tx_index: 5,
      block_height: 201,
      block_time: 1_700_000_500,
    });
    const adapter = {
      fetchAssetTransactions: vi.fn(async function* fetchAssetTransactions() {
        yield {
          items: [unexpectedTransaction],
        };
      }),
      fetchTransactionUtxo: vi.fn(),
    };
    const mockDb = createMockTransferSyncDb({
      syncState: {
        chain: 'cardano',
        asset_identifier: assetIdentifier,
        last_tx_hash: storedTransaction.tx_hash,
        last_tx_index: storedTransaction.tx_index,
        last_block_height: storedTransaction.block_height,
        last_block_time: storedTransaction.block_time,
        last_synced_page: 2,
        last_asset_transaction_raw_json: storedTransaction,
        updated_at: new Date('2024-01-14T00:00:00.000Z'),
      },
    });

    await expect(
      syncCardanoAssetTransferWithAdapter({
        db: mockDb.db,
        assetIdentifier,
        adapter,
      }),
    ).rejects.toThrow('Cardano sync boundary transaction tx-known was not found on page 2');

    expect(adapter.fetchAssetTransactions).toHaveBeenCalledWith({
      assetIdentifier,
      order: 'asc',
      fromPage: 2,
    });
    expect(adapter.fetchTransactionUtxo).not.toHaveBeenCalled();
    expect(mockDb.assetTransactionInsertValues).toEqual([]);
    expect(mockDb.transactionUtxoInsertValues).toEqual([]);
    expect(mockDb.syncState).toEqual({
      chain: 'cardano',
      asset_identifier: assetIdentifier,
      last_tx_hash: storedTransaction.tx_hash,
      last_tx_index: storedTransaction.tx_index,
      last_block_height: storedTransaction.block_height,
      last_block_time: storedTransaction.block_time,
      last_synced_page: 2,
      last_asset_transaction_raw_json: storedTransaction,
      updated_at: new Date('2024-01-14T00:00:00.000Z'),
    });
  });

  it('leaves sync state unchanged when there are no new transactions', async () => {
    const assetIdentifier = FET_CARDANO_IDENTIFIER;
    const storedTransaction = createMockBlockfrostAssetTransaction({
      tx_hash: 'tx-known',
      tx_index: 4,
      block_height: 200,
      block_time: 1_700_000_400,
    });
    const syncState: CardanoAssetTransactionSyncStateRow = {
      chain: 'cardano',
      asset_identifier: assetIdentifier,
      last_tx_hash: storedTransaction.tx_hash,
      last_tx_index: storedTransaction.tx_index,
      last_block_height: storedTransaction.block_height,
      last_block_time: storedTransaction.block_time,
      last_synced_page: 4,
      last_asset_transaction_raw_json: storedTransaction,
      updated_at: new Date('2024-01-14T00:00:00.000Z'),
    };
    const adapter = {
      fetchAssetTransactions: vi.fn(async function* fetchAssetTransactions() {
        yield {
          items: [storedTransaction],
        };
      }),
      fetchTransactionUtxo: vi.fn(),
    };
    const mockDb = createMockTransferSyncDb({
      syncState,
    });

    const result = await syncCardanoAssetTransferWithAdapter({
      db: mockDb.db,
      assetIdentifier,
      adapter,
    });

    expect(result).toEqual({
      chain: 'cardano',
      assetIdentifier,
      order: 'asc',
      fromTxHash: storedTransaction.tx_hash,
      toTxHash: storedTransaction.tx_hash,
      pageCount: 1,
      attemptedAssetTransactionCount: 0,
      insertedAssetTransactionCount: 0,
      ignoredAssetTransactionCount: 0,
      attemptedUtxoCount: 0,
      insertedUtxoCount: 0,
      ignoredUtxoCount: 0,
    });
    expect(adapter.fetchAssetTransactions).toHaveBeenCalledWith({
      assetIdentifier,
      order: 'asc',
      fromPage: 4,
    });
    expect(adapter.fetchTransactionUtxo).not.toHaveBeenCalled();
    expect(mockDb.syncState).toEqual(syncState);
  });

  it('reports ignored duplicates for both asset transactions and utxos', async () => {
    const assetIdentifier = FET_CARDANO_IDENTIFIER;
    const transaction = createMockBlockfrostAssetTransaction({
      tx_hash: 'tx-duplicate',
      tx_index: 7,
      block_height: 300,
      block_time: 1_700_000_700,
    });
    const transactionUtxo = createMockBlockfrostTransactionUtxo({ hash: transaction.tx_hash });
    const adapter = {
      fetchAssetTransactions: vi.fn(async function* fetchAssetTransactions() {
        yield {
          items: [transaction],
        };
      }),
      fetchTransactionUtxo: vi.fn().mockResolvedValue(transactionUtxo),
    };
    const mockDb = createMockTransferSyncDb({
      assetTransactionInsertedCounts: [0],
      transactionUtxoInsertedCounts: [0],
    });

    const result = await syncCardanoAssetTransferWithAdapter({
      db: mockDb.db,
      assetIdentifier,
      adapter,
    });

    expect(result.attemptedAssetTransactionCount).toBe(1);
    expect(result.insertedAssetTransactionCount).toBe(0);
    expect(result.ignoredAssetTransactionCount).toBe(1);
    expect(result.attemptedUtxoCount).toBe(1);
    expect(result.insertedUtxoCount).toBe(0);
    expect(result.ignoredUtxoCount).toBe(1);
    expect(mockDb.syncState?.last_tx_hash).toBe(transaction.tx_hash);
  });

  it('fails fast when the fetched utxo hash does not match the requested transaction hash', async () => {
    const assetIdentifier = FET_CARDANO_IDENTIFIER;
    const transaction = createMockBlockfrostAssetTransaction({
      tx_hash: 'tx-expected',
      tx_index: 8,
      block_height: 301,
      block_time: 1_700_000_800,
    });
    const adapter = {
      fetchAssetTransactions: vi.fn(async function* fetchAssetTransactions() {
        yield {
          items: [transaction],
        };
      }),
      fetchTransactionUtxo: vi.fn().mockResolvedValue(
        createMockBlockfrostTransactionUtxo({
          hash: 'tx-actual',
        }),
      ),
    };
    const mockDb = createMockTransferSyncDb();

    await expect(
      syncCardanoAssetTransferWithAdapter({
        db: mockDb.db,
        assetIdentifier,
        adapter,
      }),
    ).rejects.toThrow('Cardano transaction UTXO hash mismatch');

    expect(mockDb.assetTransactionInsertValues).toEqual([]);
    expect(mockDb.transactionUtxoInsertValues).toEqual([]);
    expect(mockDb.syncState).toBeNull();
  });

  it('limits cardano utxo fetch concurrency to 5 requests', async () => {
    const assetIdentifier = FET_CARDANO_IDENTIFIER;
    const transactions = Array.from({ length: 8 }, (_, index) =>
      createMockBlockfrostAssetTransaction({
        tx_hash: `tx-${index}`,
        tx_index: index,
        block_height: 400 + index,
        block_time: 1_700_001_000 + index,
      }),
    );
    let activeRequestCount = 0;
    let maxActiveRequestCount = 0;
    const adapter = {
      fetchAssetTransactions: vi.fn(async function* fetchAssetTransactions() {
        yield {
          items: transactions,
        };
      }),
      fetchTransactionUtxo: vi.fn((txHash: string) => {
        activeRequestCount += 1;
        maxActiveRequestCount = Math.max(maxActiveRequestCount, activeRequestCount);

        return new Promise((resolve) => {
          setTimeout(() => {
            activeRequestCount -= 1;
            resolve(createMockBlockfrostTransactionUtxo({ hash: txHash }));
          }, 5);
        });
      }),
    };
    const mockDb = createMockTransferSyncDb();

    const result = await syncCardanoAssetTransferWithAdapter({
      db: mockDb.db,
      assetIdentifier,
      adapter,
    });

    expect(result.attemptedAssetTransactionCount).toBe(8);
    expect(result.attemptedUtxoCount).toBe(8);
    expect(adapter.fetchTransactionUtxo).toHaveBeenCalledTimes(8);
    expect(maxActiveRequestCount).toBeLessThanOrEqual(5);
  });
});

function createMockTransferSyncDb(input?: {
  syncState?: CardanoAssetTransactionSyncStateRow;
  assetTransactionInsertedCounts?: number[];
  transactionUtxoInsertedCounts?: number[];
}) {
  const assetTransactionInsertValues: CardanoAssetTransactionRow[][] = [];
  const transactionUtxoInsertValues: CardanoTransactionUtxoRow[][] = [];
  const transactionUtxoInputInsertValues: CardanoTransactionUtxoInputRow[][] = [];
  const transactionUtxoInputAmountInsertValues: CardanoTransactionUtxoInputAmountRow[][] = [];
  const transactionUtxoOutputInsertValues: CardanoTransactionUtxoOutputRow[][] = [];
  const transactionUtxoOutputAmountInsertValues: CardanoTransactionUtxoOutputAmountRow[][] = [];
  const assetTransactionInsertedCounts = [...(input?.assetTransactionInsertedCounts ?? [])];
  const transactionUtxoInsertedCounts = [...(input?.transactionUtxoInsertedCounts ?? [])];
  let syncState = input?.syncState ?? null;
  const assetTransactionInsertQueryBuilder = createInsertQueryBuilder(
    assetTransactionInsertValues,
    assetTransactionInsertedCounts,
  );
  const transactionUtxoInsertQueryBuilder = createInsertQueryBuilder(
    transactionUtxoInsertValues,
    transactionUtxoInsertedCounts,
  );
  const transactionUtxoInputInsertQueryBuilder = createInsertQueryBuilder(transactionUtxoInputInsertValues);
  const transactionUtxoInputAmountInsertQueryBuilder = createInsertQueryBuilder(transactionUtxoInputAmountInsertValues);
  const transactionUtxoOutputInsertQueryBuilder = createInsertQueryBuilder(transactionUtxoOutputInsertValues);
  const transactionUtxoOutputAmountInsertQueryBuilder = createInsertQueryBuilder(
    transactionUtxoOutputAmountInsertValues,
  );

  const assetTransactionRepository = {
    createQueryBuilder: vi.fn().mockReturnValue(assetTransactionInsertQueryBuilder),
  };

  const transactionUtxoRepository = {
    createQueryBuilder: vi.fn().mockReturnValue(transactionUtxoInsertQueryBuilder),
  };

  const transactionUtxoInputRepository = {
    createQueryBuilder: vi.fn().mockReturnValue(transactionUtxoInputInsertQueryBuilder),
  };

  const transactionUtxoInputAmountRepository = {
    createQueryBuilder: vi.fn().mockReturnValue(transactionUtxoInputAmountInsertQueryBuilder),
  };

  const transactionUtxoOutputRepository = {
    createQueryBuilder: vi.fn().mockReturnValue(transactionUtxoOutputInsertQueryBuilder),
  };

  const transactionUtxoOutputAmountRepository = {
    createQueryBuilder: vi.fn().mockReturnValue(transactionUtxoOutputAmountInsertQueryBuilder),
  };

  const syncStateReadRepository = {
    findOneBy: vi.fn().mockImplementation(async () => syncState),
  };

  const syncStateWriteRepository = {
    upsert: vi.fn().mockImplementation(async (row: CardanoAssetTransactionSyncStateRow) => {
      syncState = row;
    }),
  };

  const txManager = {
    getRepository: vi.fn().mockImplementation((schema: unknown) => {
      if (schema === CardanoAssetTransactionEntitySchema) {
        return assetTransactionRepository;
      }

      if (schema === CardanoTransactionUtxoEntitySchema) {
        return transactionUtxoRepository;
      }

      if (schema === CardanoTransactionUtxoInputEntitySchema) {
        return transactionUtxoInputRepository;
      }

      if (schema === CardanoTransactionUtxoInputAmountEntitySchema) {
        return transactionUtxoInputAmountRepository;
      }

      if (schema === CardanoTransactionUtxoOutputEntitySchema) {
        return transactionUtxoOutputRepository;
      }

      if (schema === CardanoTransactionUtxoOutputAmountEntitySchema) {
        return transactionUtxoOutputAmountRepository;
      }

      if (schema === CardanoAssetTransactionSyncStateEntitySchema) {
        return syncStateWriteRepository;
      }

      throw new Error(`Unexpected transaction repository: ${String(schema)}`);
    }),
  };

  const manager = {
    getRepository: vi.fn().mockImplementation((schema: unknown) => {
      if (schema === CardanoAssetTransactionSyncStateEntitySchema) {
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
    assetTransactionInsertValues,
    transactionUtxoInsertValues,
    transactionUtxoInputInsertValues,
    transactionUtxoInputAmountInsertValues,
    transactionUtxoOutputInsertValues,
    transactionUtxoOutputAmountInsertValues,
    get syncState() {
      return syncState;
    },
  };
}

function createInsertQueryBuilder<Row extends object>(insertValues: Row[][], insertedCounts?: number[]) {
  let insertedRows: Row[] = [];

  const insertQueryBuilder = {
    insert: vi.fn().mockReturnThis(),
    into: vi.fn().mockReturnThis(),
    values: vi.fn().mockImplementation((rows: Row[]) => {
      insertedRows = rows;
      return insertQueryBuilder;
    }),
    orIgnore: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    execute: vi.fn().mockImplementation(async () => {
      insertValues.push(insertedRows);
      const insertedCount = insertedCounts?.shift() ?? insertedRows.length;

      return {
        raw: Array.from({ length: insertedCount }, () => ({ inserted: 1 })),
      };
    }),
  };

  return insertQueryBuilder;
}
