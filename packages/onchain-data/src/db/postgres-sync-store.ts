import { Client } from 'pg';
import { type AssetKey, type AssetTransferSyncState, normalizeHexBlock, OnchainAssets } from '../shared/index.js';
import type { AssetTransferEntity } from './schema.js';

type PgQueryResult<T> = {
  rows: T[];
};

type PgClientLike = {
  connect?(): Promise<void>;
  end?(): Promise<void>;
  query<T>(queryText: string, values?: unknown[]): Promise<PgQueryResult<T>>;
};

type CreatePostgresSyncStoreInput = {
  databaseUrl?: string;
  client?: PgClientLike;
  onQuery?: (queryText: string, values?: unknown[]) => void;
};

export type InsertTransferBatchResult = {
  attemptedCount: number;
  insertedCount: number;
  ignoredCount: number;
};

export interface AssetTransferSyncTransaction {
  insertTransferBatch(items: AssetTransferEntity[]): Promise<InsertTransferBatchResult>;
  upsertSyncState(input: AssetTransferSyncState): Promise<void>;
}

export interface AssetTransferSyncStore {
  findByAssetKey(assetKey: AssetKey): Promise<AssetTransferSyncState | null>;
  withTransaction<T>(callback: (tx: AssetTransferSyncTransaction) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

type FindSyncStateRow = {
  chain: string;
  asset_identifier: string;
  last_synced_block: string;
  last_transaction_hash: string | null;
  last_log_index: number | string | null;
  updated_at_unix: string;
};

type InsertTransferBatchRow = {
  attempted_count: string;
  inserted_count: string;
};

export async function createPostgresSyncStore(input: CreatePostgresSyncStoreInput): Promise<AssetTransferSyncStore> {
  if (!input.client && !input.databaseUrl) {
    throw new Error('Either databaseUrl or client must be provided to createPostgresSyncStore');
  }

  const client = input.client ?? new Client({ connectionString: input.databaseUrl });

  if (client.connect) {
    await client.connect();
  }

  return new DefaultAssetTransferSyncStore(client, input.onQuery);
}

class DefaultAssetTransferSyncStore implements AssetTransferSyncStore {
  constructor(
    private readonly client: PgClientLike,
    private readonly onQuery?: (queryText: string, values?: unknown[]) => void,
  ) {}

  async findByAssetKey(assetKey: AssetKey): Promise<AssetTransferSyncState | null> {
    const asset = OnchainAssets[assetKey];
    const result = await this.query<FindSyncStateRow>(
      `
        SELECT
          chain,
          asset_identifier,
          last_synced_block,
          last_transaction_hash,
          last_log_index,
          updated_at_unix
        FROM asset_transfer_sync_state
        WHERE chain = $1 AND asset_identifier = $2
        LIMIT 1
      `,
      [asset.chain, asset.assetIdentifier],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      chain: row.chain,
      assetIdentifier: row.asset_identifier,
      lastSyncedBlock: normalizeHexBlock(BigInt(row.last_synced_block)),
      ...(row.last_transaction_hash != null && {
        lastTransactionHash: row.last_transaction_hash,
      }),
      ...(row.last_log_index != null && {
        lastLogIndex: Number(row.last_log_index),
      }),
      updatedAt: new Date(Number(row.updated_at_unix) * 1000).toISOString(),
    };
  }

  async withTransaction<T>(callback: (tx: AssetTransferSyncTransaction) => Promise<T>): Promise<T> {
    await this.query('BEGIN');

    try {
      const result = await callback({
        insertTransferBatch: (items) => this.insertTransferBatch(items),
        upsertSyncState: (input) => this.upsertSyncState(input),
      });
      await this.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await this.query('ROLLBACK');
      } catch {
        // Prefer surfacing the original write failure.
      }
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.client.end) {
      await this.client.end();
    }
  }

  private async insertTransferBatch(items: AssetTransferEntity[]): Promise<InsertTransferBatchResult> {
    const result = await this.query<InsertTransferBatchRow>(
      `
        WITH input_rows AS (
          SELECT *
          FROM unnest(
            $1::text[],
            $2::bigint[],
            $3::text[],
            $4::integer[],
            $5::text[],
            $6::text[],
            $7::text[],
            $8::bigint[]
          ) AS rows(
            asset_key,
            block_number,
            transaction_hash,
            log_index,
            from_address,
            to_address,
            amount,
            block_timestamp_unix
          )
        ),
        inserted AS (
          INSERT INTO asset_transfers (
            asset_key,
            block_number,
            transaction_hash,
            log_index,
            from_address,
            to_address,
            amount,
            block_timestamp_unix
          )
          SELECT
            asset_key,
            block_number,
            transaction_hash,
            log_index,
            from_address,
            to_address,
            amount,
            block_timestamp_unix
          FROM input_rows
          ON CONFLICT DO NOTHING
          RETURNING 1
        )
        SELECT
          (SELECT COUNT(*) FROM input_rows) AS attempted_count,
          (SELECT COUNT(*) FROM inserted) AS inserted_count
      `,
      [
        items.map((item) => item.asset_key),
        items.map((item) => String(item.block_number)),
        items.map((item) => item.transaction_hash),
        items.map((item) => item.log_index),
        items.map((item) => item.from_address),
        items.map((item) => item.to_address),
        items.map((item) => item.amount),
        items.map((item) => (item.block_timestamp_unix == null ? null : String(item.block_timestamp_unix))),
      ],
    );

    const row = result.rows[0];
    const attemptedCount = Number(row?.attempted_count ?? 0);
    const insertedCount = Number(row?.inserted_count ?? 0);

    return {
      attemptedCount,
      insertedCount,
      ignoredCount: attemptedCount - insertedCount,
    };
  }

  private async upsertSyncState(input: AssetTransferSyncState): Promise<void> {
    await this.query(
      `
        INSERT INTO asset_transfer_sync_state (
          chain,
          asset_identifier,
          last_synced_block,
          last_transaction_hash,
          last_log_index,
          updated_at_unix
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (chain, asset_identifier)
        DO UPDATE SET
          last_synced_block = EXCLUDED.last_synced_block,
          last_transaction_hash = EXCLUDED.last_transaction_hash,
          last_log_index = EXCLUDED.last_log_index,
          updated_at_unix = EXCLUDED.updated_at_unix
      `,
      [
        input.chain,
        input.assetIdentifier,
        BigInt(normalizeHexBlock(input.lastSyncedBlock)).toString(),
        input.lastTransactionHash ?? null,
        input.lastLogIndex ?? null,
        Math.floor(new Date(input.updatedAt).getTime() / 1000),
      ],
    );
  }

  private query<T>(queryText: string, values?: unknown[]): Promise<PgQueryResult<T>> {
    this.onQuery?.(queryText, values);
    return this.client.query<T>(queryText, values);
  }
}
