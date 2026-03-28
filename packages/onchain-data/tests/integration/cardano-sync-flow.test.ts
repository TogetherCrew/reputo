import type { DataSource } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { syncCardanoAssetTransferWithAdapter } from '../../src/adapters/cardano/transfers/sync.js';
import { closeTestDb, createTestDb, hasContainerRuntime } from '../utils/db-helpers.js';
import {
  createMockBlockfrostAssetTransaction,
  createMockBlockfrostTransactionUtxo,
  FET_CARDANO_IDENTIFIER,
} from '../utils/mock-helpers.js';

const describePostgres = hasContainerRuntime ? describe : describe.skip;

describePostgres('Cardano raw sync flow', () => {
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
          AND table_name IN (
            'cardano_asset_transactions',
            'cardano_transaction_utxos',
            'cardano_transaction_utxo_inputs',
            'cardano_transaction_utxo_input_amounts',
            'cardano_transaction_utxo_outputs',
            'cardano_transaction_utxo_output_amounts',
            'cardano_asset_transaction_sync_state'
          )
        ORDER BY table_name
      `,
    );

    expect(result).toEqual([
      { table_name: 'cardano_asset_transaction_sync_state' },
      { table_name: 'cardano_asset_transactions' },
      { table_name: 'cardano_transaction_utxo_input_amounts' },
      { table_name: 'cardano_transaction_utxo_inputs' },
      { table_name: 'cardano_transaction_utxo_output_amounts' },
      { table_name: 'cardano_transaction_utxo_outputs' },
      { table_name: 'cardano_transaction_utxos' },
    ]);

    const syncStateColumns = await db.query<{ column_name: string }>(
      `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'cardano_asset_transaction_sync_state'
          AND column_name = 'last_synced_page'
      `,
    );

    expect(syncStateColumns).toEqual([{ column_name: 'last_synced_page' }]);
  });

  it('syncs raw asset transactions and utxos into PostgreSQL', async () => {
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

    const result = await syncCardanoAssetTransferWithAdapter({
      db,
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

    const transactionRows = await db.query<{
      tx_hash: string;
      tx_index: number;
      raw_json: unknown;
    }>(
      `
        SELECT tx_hash, tx_index, raw_json
        FROM cardano_asset_transactions
        ORDER BY tx_hash
      `,
    );

    expect(transactionRows).toEqual([
      {
        tx_hash: 'tx-1',
        tx_index: 1,
        raw_json: firstTransaction,
      },
      {
        tx_hash: 'tx-2',
        tx_index: 2,
        raw_json: secondTransaction,
      },
    ]);

    const utxoRows = await db.query<{
      tx_hash: string;
      raw_json: unknown;
    }>(
      `
        SELECT tx_hash, raw_json
        FROM cardano_transaction_utxos
        ORDER BY tx_hash
      `,
    );

    expect(utxoRows).toEqual([
      {
        tx_hash: 'tx-1',
        raw_json: firstTransactionUtxo,
      },
      {
        tx_hash: 'tx-2',
        raw_json: secondTransactionUtxo,
      },
    ]);

    const inputRows = await db.query<{
      tx_hash: string;
      input_index: number;
      address: string;
      source_tx_hash: string;
      source_output_index: number;
      data_hash: string | null;
      inline_datum: string | null;
      reference_script_hash: string | null;
      collateral: boolean;
      reference: boolean | null;
    }>(
      `
        SELECT
          tx_hash,
          input_index,
          address,
          source_tx_hash,
          source_output_index,
          data_hash,
          inline_datum,
          reference_script_hash,
          collateral,
          reference
        FROM cardano_transaction_utxo_inputs
        ORDER BY tx_hash, input_index
      `,
    );

    expect(inputRows).toEqual([
      {
        tx_hash: 'tx-1',
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
        tx_hash: 'tx-1',
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
        tx_hash: 'tx-2',
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

    const inputAmountRows = await db.query<{
      tx_hash: string;
      input_index: number;
      amount_index: number;
      unit: string;
      quantity: string;
    }>(
      `
        SELECT tx_hash, input_index, amount_index, unit, quantity
        FROM cardano_transaction_utxo_input_amounts
        ORDER BY tx_hash, input_index, amount_index
      `,
    );

    expect(inputAmountRows).toEqual([
      {
        tx_hash: 'tx-1',
        input_index: 0,
        amount_index: 0,
        unit: 'lovelace',
        quantity: '42000000',
      },
      {
        tx_hash: 'tx-1',
        input_index: 0,
        amount_index: 1,
        unit: FET_CARDANO_IDENTIFIER,
        quantity: '12',
      },
      {
        tx_hash: 'tx-1',
        input_index: 1,
        amount_index: 0,
        unit: 'lovelace',
        quantity: '42',
      },
      {
        tx_hash: 'tx-2',
        input_index: 0,
        amount_index: 0,
        unit: 'lovelace',
        quantity: '42000000',
      },
      {
        tx_hash: 'tx-2',
        input_index: 0,
        amount_index: 1,
        unit: FET_CARDANO_IDENTIFIER,
        quantity: '12',
      },
    ]);

    const outputRows = await db.query<{
      tx_hash: string;
      output_index: number;
      address: string;
      data_hash: string | null;
      inline_datum: string | null;
      collateral: boolean;
      reference_script_hash: string | null;
      consumed_by_tx_hash: string | null;
    }>(
      `
        SELECT
          tx_hash,
          output_index,
          address,
          data_hash,
          inline_datum,
          collateral,
          reference_script_hash,
          consumed_by_tx_hash
        FROM cardano_transaction_utxo_outputs
        ORDER BY tx_hash, output_index
      `,
    );

    expect(outputRows).toEqual([
      {
        tx_hash: 'tx-1',
        output_index: 0,
        address: 'addr-output-1',
        data_hash: null,
        inline_datum: null,
        collateral: false,
        reference_script_hash: null,
        consumed_by_tx_hash: null,
      },
      {
        tx_hash: 'tx-1',
        output_index: 1,
        address: 'addr-output-2',
        data_hash: 'output-data-hash',
        inline_datum: 'output-inline-datum',
        collateral: true,
        reference_script_hash: 'output-script-hash',
        consumed_by_tx_hash: 'tx-consumer',
      },
      {
        tx_hash: 'tx-2',
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

    const outputAmountRows = await db.query<{
      tx_hash: string;
      output_index: number;
      amount_index: number;
      unit: string;
      quantity: string;
    }>(
      `
        SELECT tx_hash, output_index, amount_index, unit, quantity
        FROM cardano_transaction_utxo_output_amounts
        ORDER BY tx_hash, output_index, amount_index
      `,
    );

    expect(outputAmountRows).toEqual([
      {
        tx_hash: 'tx-1',
        output_index: 0,
        amount_index: 0,
        unit: 'lovelace',
        quantity: '21000000',
      },
      {
        tx_hash: 'tx-1',
        output_index: 0,
        amount_index: 1,
        unit: FET_CARDANO_IDENTIFIER,
        quantity: '12',
      },
      {
        tx_hash: 'tx-1',
        output_index: 1,
        amount_index: 0,
        unit: 'lovelace',
        quantity: '7',
      },
      {
        tx_hash: 'tx-2',
        output_index: 0,
        amount_index: 0,
        unit: 'lovelace',
        quantity: '21000000',
      },
      {
        tx_hash: 'tx-2',
        output_index: 0,
        amount_index: 1,
        unit: FET_CARDANO_IDENTIFIER,
        quantity: '12',
      },
    ]);

    const syncStateRows = await db.query<{
      last_tx_hash: string;
      last_tx_index: number;
      last_synced_page: number;
      last_asset_transaction_raw_json: unknown;
      updated_at: Date;
    }>(
      `
        SELECT last_tx_hash, last_tx_index, last_synced_page, last_asset_transaction_raw_json, updated_at
        FROM cardano_asset_transaction_sync_state
      `,
    );

    expect(syncStateRows).toEqual([
      {
        last_tx_hash: 'tx-2',
        last_tx_index: 2,
        last_synced_page: 1,
        last_asset_transaction_raw_json: secondTransaction,
        updated_at: new Date('2024-01-15T12:00:00.000Z'),
      },
    ]);
  });

  it('resumes cleanly from the stored page without reprocessing earlier transactions', async () => {
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
    const thirdTransaction = createMockBlockfrostAssetTransaction({
      tx_hash: 'tx-3',
      tx_index: 3,
      block_height: 102,
      block_time: 1_700_000_300,
    });

    await syncCardanoAssetTransferWithAdapter({
      db,
      assetIdentifier,
      adapter: {
        fetchAssetTransactions: vi.fn(async function* fetchAssetTransactions() {
          yield {
            items: [firstTransaction, secondTransaction],
          };
        }),
        fetchTransactionUtxo: vi
          .fn()
          .mockResolvedValueOnce(createMockBlockfrostTransactionUtxo({ hash: firstTransaction.tx_hash }))
          .mockResolvedValueOnce(createMockBlockfrostTransactionUtxo({ hash: secondTransaction.tx_hash })),
      },
      clock: () => new Date('2024-01-15T12:00:00.000Z'),
    });

    const resumeAdapter = {
      fetchAssetTransactions: vi.fn(async function* fetchAssetTransactions() {
        yield {
          items: [firstTransaction, secondTransaction, thirdTransaction],
        };
      }),
      fetchTransactionUtxo: vi
        .fn()
        .mockResolvedValue(createMockBlockfrostTransactionUtxo({ hash: thirdTransaction.tx_hash })),
    };

    const result = await syncCardanoAssetTransferWithAdapter({
      db,
      assetIdentifier,
      adapter: resumeAdapter,
      clock: () => new Date('2024-01-16T12:00:00.000Z'),
    });

    expect(result).toEqual({
      chain: 'cardano',
      assetIdentifier,
      order: 'asc',
      fromTxHash: secondTransaction.tx_hash,
      toTxHash: thirdTransaction.tx_hash,
      pageCount: 1,
      attemptedAssetTransactionCount: 1,
      insertedAssetTransactionCount: 1,
      ignoredAssetTransactionCount: 0,
      attemptedUtxoCount: 1,
      insertedUtxoCount: 1,
      ignoredUtxoCount: 0,
    });
    expect(resumeAdapter.fetchAssetTransactions).toHaveBeenCalledWith({
      assetIdentifier,
      order: 'asc',
      fromPage: 1,
    });
    expect(resumeAdapter.fetchTransactionUtxo).toHaveBeenCalledTimes(1);
    expect(resumeAdapter.fetchTransactionUtxo).toHaveBeenCalledWith(thirdTransaction.tx_hash);

    const transactionRows = await db.query<{ tx_hash: string }>(
      `
        SELECT tx_hash
        FROM cardano_asset_transactions
        WHERE asset_identifier = $1
        ORDER BY tx_hash
      `,
      [assetIdentifier],
    );

    expect(transactionRows).toEqual([{ tx_hash: 'tx-1' }, { tx_hash: 'tx-2' }, { tx_hash: 'tx-3' }]);

    const syncStateRows = await db.query<{
      last_tx_hash: string;
      last_synced_page: number;
      last_asset_transaction_raw_json: unknown;
    }>(
      `
        SELECT last_tx_hash, last_synced_page, last_asset_transaction_raw_json
        FROM cardano_asset_transaction_sync_state
        WHERE chain = 'cardano' AND asset_identifier = $1
      `,
      [assetIdentifier],
    );

    expect(syncStateRows).toEqual([
      {
        last_tx_hash: 'tx-3',
        last_synced_page: 1,
        last_asset_transaction_raw_json: thirdTransaction,
      },
    ]);
  });

  it('reuses the same transaction utxo row across different assets', async () => {
    const sharedTxHash = 'tx-shared';
    const firstAssetIdentifier = FET_CARDANO_IDENTIFIER;
    const secondAssetIdentifier = `${FET_CARDANO_IDENTIFIER}01`;
    const sharedTransaction = createMockBlockfrostAssetTransaction({
      tx_hash: sharedTxHash,
      tx_index: 3,
      block_height: 102,
      block_time: 1_700_000_300,
    });
    const sharedTransactionUtxo = createMockBlockfrostTransactionUtxo({ hash: sharedTxHash });

    await syncCardanoAssetTransferWithAdapter({
      db,
      assetIdentifier: firstAssetIdentifier,
      adapter: {
        fetchAssetTransactions: vi.fn(async function* fetchAssetTransactions() {
          yield {
            items: [sharedTransaction],
          };
        }),
        fetchTransactionUtxo: vi.fn().mockResolvedValue(sharedTransactionUtxo),
      },
    });

    await syncCardanoAssetTransferWithAdapter({
      db,
      assetIdentifier: secondAssetIdentifier,
      adapter: {
        fetchAssetTransactions: vi.fn(async function* fetchAssetTransactions() {
          yield {
            items: [sharedTransaction],
          };
        }),
        fetchTransactionUtxo: vi.fn().mockResolvedValue(sharedTransactionUtxo),
      },
    });

    const transactionRows = await db.query<{
      asset_identifier: string;
      tx_hash: string;
    }>(
      `
        SELECT asset_identifier, tx_hash
        FROM cardano_asset_transactions
        WHERE tx_hash = $1
        ORDER BY asset_identifier
      `,
      [sharedTxHash],
    );

    expect(transactionRows).toEqual([
      {
        asset_identifier: firstAssetIdentifier,
        tx_hash: sharedTxHash,
      },
      {
        asset_identifier: secondAssetIdentifier,
        tx_hash: sharedTxHash,
      },
    ]);

    const utxoRows = await db.query<{ tx_hash: string }>(
      `
        SELECT tx_hash
        FROM cardano_transaction_utxos
        WHERE tx_hash = $1
      `,
      [sharedTxHash],
    );

    expect(utxoRows).toEqual([{ tx_hash: sharedTxHash }]);

    const inputRows = await db.query<{ tx_hash: string; input_index: number }>(
      `
        SELECT tx_hash, input_index
        FROM cardano_transaction_utxo_inputs
        WHERE tx_hash = $1
        ORDER BY input_index
      `,
      [sharedTxHash],
    );

    expect(inputRows).toEqual([{ tx_hash: sharedTxHash, input_index: 0 }]);

    const inputAmountRows = await db.query<{ tx_hash: string; input_index: number; amount_index: number }>(
      `
        SELECT tx_hash, input_index, amount_index
        FROM cardano_transaction_utxo_input_amounts
        WHERE tx_hash = $1
        ORDER BY input_index, amount_index
      `,
      [sharedTxHash],
    );

    expect(inputAmountRows).toEqual([
      { tx_hash: sharedTxHash, input_index: 0, amount_index: 0 },
      { tx_hash: sharedTxHash, input_index: 0, amount_index: 1 },
    ]);

    const outputRows = await db.query<{ tx_hash: string; output_index: number }>(
      `
        SELECT tx_hash, output_index
        FROM cardano_transaction_utxo_outputs
        WHERE tx_hash = $1
        ORDER BY output_index
      `,
      [sharedTxHash],
    );

    expect(outputRows).toEqual([{ tx_hash: sharedTxHash, output_index: 0 }]);

    const outputAmountRows = await db.query<{ tx_hash: string; output_index: number; amount_index: number }>(
      `
        SELECT tx_hash, output_index, amount_index
        FROM cardano_transaction_utxo_output_amounts
        WHERE tx_hash = $1
        ORDER BY output_index, amount_index
      `,
      [sharedTxHash],
    );

    expect(outputAmountRows).toEqual([
      { tx_hash: sharedTxHash, output_index: 0, amount_index: 0 },
      { tx_hash: sharedTxHash, output_index: 0, amount_index: 1 },
    ]);
  });
});
