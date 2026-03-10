CREATE TABLE IF NOT EXISTS token_transfers (
  id TEXT PRIMARY KEY,
  token_chain TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  block_number INTEGER NOT NULL,
  transaction_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,
  from_address TEXT,
  to_address TEXT,
  amount TEXT NOT NULL,
  block_timestamp TEXT,
  raw_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS token_transfers_unique_event_idx
  ON token_transfers(token_chain, transaction_hash, log_index);

CREATE TABLE IF NOT EXISTS token_transfer_sync_state (
  token_chain TEXT PRIMARY KEY,
  last_synced_block INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);
