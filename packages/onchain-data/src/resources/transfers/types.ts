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
 * Options for querying transfers (low-level, chain ID and canonical addresses).
 */
export type TransferQueryOptions = {
  chainId: string;
  tokenAddress?: string;
  fromBlock?: number;
  toBlock?: number;
};

/**
 * Parameters for deterministic transfer queries (public API).
 * Uses runtime inputs: chain name and raw token contract address.
 * Point-in-time: toBlock is inclusive (all events where block_number <= toBlock).
 * Bounded range: optional fromBlock; when both are set, only rows in [fromBlock, toBlock].
 */
export type DeterministicTransferQueryParams = {
  /** Chain name (e.g. 'ethereum'), resolved to chain_id for DB lookup */
  chain: string;
  /** Token contract address (EVM: canonicalized before filtering) */
  tokenContractAddress: string;
  /** Optional lower bound (inclusive). Omit for point-in-time from genesis */
  fromBlock?: number;
  /** Upper bound (inclusive). Required. Point-in-time semantics: block_number <= toBlock */
  toBlock: number;
};
