/**
 * Schema version for database migrations
 */
export const SCHEMA_VERSION = '1.0.0';

/**
 * SQL statements to bootstrap the database schema.
 *
 * Executed in order on every {@link import('./client.js').createDb} call.
 * All statements use `IF NOT EXISTS` so they are safe to re-run.
 */
export const BOOTSTRAP_SQL: string[] = [
  'PRAGMA journal_mode = WAL;',
  'PRAGMA busy_timeout = 5000;',

  `CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
   );`,

  `CREATE TABLE IF NOT EXISTS transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chain_id TEXT NOT NULL,
      block_number INTEGER NOT NULL,
      block_hash TEXT NOT NULL,
      block_timestamp TEXT NOT NULL,
      transaction_hash TEXT NOT NULL,
      log_index INTEGER NOT NULL,
      from_address TEXT NOT NULL,
      to_address TEXT NOT NULL,
      token_address TEXT NOT NULL,
      value TEXT NOT NULL,
      asset_category TEXT,
      raw_json TEXT NOT NULL,
      UNIQUE(chain_id, transaction_hash, log_index)
   );`,

  `CREATE TABLE IF NOT EXISTS sync_cursors (
      chain_id TEXT NOT NULL,
      token_address TEXT NOT NULL,
      cursor_block INTEGER NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (chain_id, token_address)
   );`,

  `CREATE TABLE IF NOT EXISTS sync_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chain_id TEXT NOT NULL,
      token_address TEXT NOT NULL,
      requested_from_block INTEGER NOT NULL,
      requested_to_block INTEGER NOT NULL,
      effective_to_block INTEGER,
      status TEXT NOT NULL,
      error_summary TEXT,
      started_at TEXT NOT NULL,
      completed_at TEXT
   );`,

  'CREATE INDEX IF NOT EXISTS idx_transfers_chain_token ON transfers(chain_id, token_address);',
  'CREATE INDEX IF NOT EXISTS idx_transfers_chain_block ON transfers(chain_id, block_number);',
  'CREATE INDEX IF NOT EXISTS idx_transfers_chain_token_block ON transfers(chain_id, token_address, block_number);',
  'CREATE INDEX IF NOT EXISTS idx_transfers_from ON transfers(from_address);',
  'CREATE INDEX IF NOT EXISTS idx_transfers_to ON transfers(to_address);',
];
