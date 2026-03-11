CREATE TABLE IF NOT EXISTS token_transfers (
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

CREATE TABLE IF NOT EXISTS token_transfer_sync_state (
  token_chain TEXT PRIMARY KEY,
  last_synced_block TEXT NOT NULL,
  last_transaction_hash TEXT,
  last_log_index INTEGER,
  updated_at TEXT NOT NULL
);
