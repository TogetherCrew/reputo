import { DataSource } from 'typeorm';
import { AssetTransferSchema, AssetTransferSyncStateSchema } from './schema.js';

const BOOTSTRAP_SQL = `
CREATE TABLE IF NOT EXISTS asset_transfers (
    asset_key TEXT NOT NULL,
    transaction_hash TEXT NOT NULL,
    log_index INTEGER NOT NULL,
    block_number INTEGER NOT NULL,
    from_address TEXT,
    to_address TEXT,
    amount TEXT NOT NULL,
    block_timestamp_unix INTEGER,
    PRIMARY KEY (asset_key, transaction_hash, log_index)
);

CREATE INDEX IF NOT EXISTS idx_asset_transfers_asset_from_block_order
    ON asset_transfers (asset_key, from_address, block_number, log_index, transaction_hash);

CREATE INDEX IF NOT EXISTS idx_asset_transfers_asset_to_block_order
    ON asset_transfers (asset_key, to_address, block_number, log_index, transaction_hash);

CREATE TABLE IF NOT EXISTS asset_transfer_sync_state (
    chain TEXT NOT NULL,
    asset_identifier TEXT NOT NULL,
    last_synced_block INTEGER NOT NULL,
    last_transaction_hash TEXT,
    last_log_index INTEGER,
    updated_at_unix INTEGER NOT NULL,
    PRIMARY KEY (chain, asset_identifier)
);
`;

export async function createDataSource(dbPath: string): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: dbPath,
    entities: [AssetTransferSchema, AssetTransferSyncStateSchema],

    synchronize: false,

    prepareDatabase: (db) => {
      db.pragma('journal_mode = WAL');
      db.pragma('synchronous = NORMAL');
      db.pragma('temp_store = MEMORY');
      db.pragma('busy_timeout = 10000');
      db.exec(BOOTSTRAP_SQL);
    },
  });

  await dataSource.initialize();
  return dataSource;
}
