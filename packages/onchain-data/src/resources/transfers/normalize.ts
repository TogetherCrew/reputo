import { canonicalizeEvmAddress } from '../../shared/utils/evm.js';
import type { TransferEvent, TransferRecord } from './types.js';

/**
 * Normalize a raw transfer event into a database record.
 *
 * EVM addresses (from, to, token) are canonicalized so query and sync use
 * the same format and callers do not miss data due to case differences.
 * The full provider payload is preserved in `rawJson` so no information
 * is lost even if the normalized columns don't cover every provider-specific field.
 */
export function normalizeTransferToRecord(data: TransferEvent): TransferRecord {
  return {
    chainId: data.chain_id,
    blockNumber: data.block_number,
    blockHash: data.block_hash,
    blockTimestamp: data.block_timestamp,
    transactionHash: data.transaction_hash,
    logIndex: data.log_index,
    fromAddress: canonicalizeEvmAddress(data.from_address),
    toAddress: canonicalizeEvmAddress(data.to_address),
    tokenAddress: canonicalizeEvmAddress(data.token_address),
    value: data.value,
    assetCategory: data.asset_category ?? null,
    rawJson: JSON.stringify(data),
  };
}
