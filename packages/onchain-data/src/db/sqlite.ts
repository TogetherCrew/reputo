import BetterSqlite3 from 'better-sqlite3';
import { INITIAL_MIGRATION } from './schema.js';

export type Database = {
  readonly sqlite: BetterSqlite3.Database;
  transaction<T>(fn: () => T): T;
  close(): void;
};

export function createDatabase(dbPath: string): Database {
  const sqlite = new BetterSqlite3(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('busy_timeout = 5000');
  sqlite.exec(INITIAL_MIGRATION);
  migrateLegacyBlockColumns(sqlite);
  migrateDropRedundantTransferColumns(sqlite);
  migrateDropContractAddress(sqlite);
  migrateSyncStateLastEventColumns(sqlite);

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

function migrateLegacyBlockColumns(sqlite: BetterSqlite3.Database): void {
  const transferBlockType = getColumnType(sqlite, 'token_transfers', 'block_number');
  if (transferBlockType && transferBlockType !== 'TEXT') {
    sqlite.transaction(() => {
      sqlite.exec(`
CREATE TABLE token_transfers__migrated (
  token_chain TEXT NOT NULL,
  block_number TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,
  from_address TEXT,
  to_address TEXT,
  amount TEXT NOT NULL,
  block_timestamp TEXT,
  PRIMARY KEY (token_chain, transaction_hash, log_index)
);

INSERT INTO token_transfers__migrated (
  token_chain,
  block_number,
  transaction_hash,
  log_index,
  from_address,
  to_address,
  amount,
  block_timestamp
)
SELECT
  token_chain,
  CASE
    WHEN typeof(block_number) IN ('integer', 'real') THEN printf('0x%x', block_number)
    ELSE '0x' || COALESCE(NULLIF(ltrim(substr(lower(block_number), 3), '0'), ''), '0')
  END,
  transaction_hash,
  log_index,
  from_address,
  to_address,
  amount,
  block_timestamp
FROM token_transfers;

DROP TABLE token_transfers;

ALTER TABLE token_transfers__migrated RENAME TO token_transfers;
            `);
    })();
  }

  const syncStateBlockType = getColumnType(sqlite, 'token_transfer_sync_state', 'last_synced_block');
  if (syncStateBlockType && syncStateBlockType !== 'TEXT') {
    sqlite.transaction(() => {
      sqlite.exec(`
CREATE TABLE token_transfer_sync_state__migrated (
  token_chain TEXT PRIMARY KEY,
  last_synced_block TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO token_transfer_sync_state__migrated (
  token_chain,
  last_synced_block,
  updated_at
)
SELECT
  token_chain,
  CASE
    WHEN typeof(last_synced_block) IN ('integer', 'real') THEN printf('0x%x', last_synced_block)
    ELSE '0x' || COALESCE(NULLIF(ltrim(substr(lower(last_synced_block), 3), '0'), ''), '0')
  END,
  updated_at
FROM token_transfer_sync_state;

DROP TABLE token_transfer_sync_state;

ALTER TABLE token_transfer_sync_state__migrated RENAME TO token_transfer_sync_state;
            `);
    })();
  }
}

function migrateDropRedundantTransferColumns(sqlite: BetterSqlite3.Database): void {
  const hasId = getColumnType(sqlite, 'token_transfers', 'id') !== null;
  const hasRawJson = getColumnType(sqlite, 'token_transfers', 'raw_json') !== null;
  if (!hasId && !hasRawJson) return;

  sqlite.transaction(() => {
    sqlite.exec(`
CREATE TABLE token_transfers__migrated (
  token_chain TEXT NOT NULL,
  block_number TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,
  from_address TEXT,
  to_address TEXT,
  amount TEXT NOT NULL,
  block_timestamp TEXT,
  PRIMARY KEY (token_chain, transaction_hash, log_index)
);

INSERT INTO token_transfers__migrated (
  token_chain,
  block_number,
  transaction_hash,
  log_index,
  from_address,
  to_address,
  amount,
  block_timestamp
)
SELECT
  token_chain,
  CASE
    WHEN typeof(block_number) IN ('integer', 'real') THEN printf('0x%x', block_number)
    ELSE '0x' || COALESCE(NULLIF(ltrim(substr(lower(block_number), 3), '0'), ''), '0')
  END,
  transaction_hash,
  log_index,
  from_address,
  to_address,
  amount,
  block_timestamp
FROM token_transfers;

DROP TABLE token_transfers;

ALTER TABLE token_transfers__migrated RENAME TO token_transfers;
        `);
  })();
}

function migrateDropContractAddress(sqlite: BetterSqlite3.Database): void {
  const hasContractAddress = getColumnType(sqlite, 'token_transfers', 'contract_address') !== null;
  if (!hasContractAddress) return;

  sqlite.transaction(() => {
    sqlite.exec(`
CREATE TABLE token_transfers__no_contract (
  token_chain TEXT NOT NULL,
  block_number TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,
  from_address TEXT,
  to_address TEXT,
  amount TEXT NOT NULL,
  block_timestamp TEXT,
  PRIMARY KEY (token_chain, transaction_hash, log_index)
);

INSERT INTO token_transfers__no_contract (
  token_chain,
  block_number,
  transaction_hash,
  log_index,
  from_address,
  to_address,
  amount,
  block_timestamp
)
SELECT
  token_chain,
  block_number,
  transaction_hash,
  log_index,
  from_address,
  to_address,
  amount,
  block_timestamp
FROM token_transfers;

DROP TABLE token_transfers;

ALTER TABLE token_transfers__no_contract RENAME TO token_transfers;
    `);
  })();
}

function migrateSyncStateLastEventColumns(sqlite: BetterSqlite3.Database): void {
  const hasLastTxHash = getColumnType(sqlite, 'token_transfer_sync_state', 'last_transaction_hash') !== null;
  if (hasLastTxHash) return;

  sqlite.exec('ALTER TABLE token_transfer_sync_state ADD COLUMN last_transaction_hash TEXT');
  sqlite.exec('ALTER TABLE token_transfer_sync_state ADD COLUMN last_log_index INTEGER');
}

function getColumnType(sqlite: BetterSqlite3.Database, tableName: string, columnName: string): string | null {
  const rows = sqlite.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string; type: string }>;
  const column = rows.find((row) => row.name === columnName);
  return column?.type.toUpperCase() ?? null;
}
