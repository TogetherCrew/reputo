import type { TransferEvent, TransferRecord } from './types.js';

/**
 * Normalize a raw transfer event into a database record.
 *
 * The full provider payload is preserved in `rawJson` so no
 * information is lost even if the normalized columns don't cover
 * every provider-specific field.
 */
export function normalizeTransferToRecord(data: TransferEvent): TransferRecord {
  return {
    chainId: data.chain_id,
    blockNumber: data.block_number,
    blockHash: data.block_hash,
    blockTimestamp: data.block_timestamp,
    transactionHash: data.transaction_hash,
    logIndex: data.log_index,
    fromAddress: data.from_address,
    toAddress: data.to_address,
    tokenAddress: data.token_address,
    value: data.value,
    assetCategory: data.asset_category ?? null,
    rawJson: JSON.stringify(data),
  };
}
