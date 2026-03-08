/**
 * Raw transfer event from a provider (e.g. Alchemy).
 *
 * Kept intentionally chain-neutral so the same type works for
 * EVM, Cosmos, or any future provider adapter.
 */
export type TransferEvent = {
  chain_id: string;
  block_number: number;
  block_hash: string;
  block_timestamp: string;
  transaction_hash: string;
  log_index: number;
  from_address: string;
  to_address: string;
  token_address: string;
  value: string;
  asset_category?: string | null;
  [key: string]: unknown;
};

/**
 * Normalized database record for a transfer event
 */
export type TransferRecord = {
  chainId: string;
  blockNumber: number;
  blockHash: string;
  blockTimestamp: string;
  transactionHash: string;
  logIndex: number;
  fromAddress: string;
  toAddress: string;
  tokenAddress: string;
  value: string;
  assetCategory: string | null;
  rawJson: string;
};

/**
 * Options for querying transfers
 */
export type TransferQueryOptions = {
  chainId: string;
  tokenAddress?: string;
  fromBlock?: number;
  toBlock?: number;
};
