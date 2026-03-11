export type TokenTransferRow = {
  token_chain: string;
  block_number: string;
  transaction_hash: string;
  log_index: number;
  from_address: string | null;
  to_address: string | null;
  amount: string;
  block_timestamp: string | null;
};

export type TokenTransferSyncStateRow = {
  token_chain: string;
  last_synced_block: string;
  last_transaction_hash: string | null;
  last_log_index: number | null;
  updated_at: string;
};

export const INITIAL_MIGRATION = `
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
`;
