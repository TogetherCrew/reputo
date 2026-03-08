import type { TransferEvent } from '../../../resources/transfers/types.js';
import { fromHex } from './finality.js';
import type { AlchemyTransfer } from './types.js';

/**
 * Extract log index from Alchemy's uniqueId.
 * Known formats: `{hash}:log:{logIndex}` or `{hash}-{category}-{index}`.
 */
function parseLogIndex(uniqueId: string): number {
  const colonMatch = uniqueId.match(/:log:(\d+)$/);
  if (colonMatch) {
    return Number.parseInt(colonMatch[1], 10);
  }
  const parts = uniqueId.split('-');
  const last = parts[parts.length - 1];
  const parsed = Number.parseInt(last, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Convert a hex value string to a decimal string.
 * Uses BigInt to handle 256-bit token amounts accurately.
 */
function hexToDecimalString(hex: string | null): string {
  if (!hex || hex === '0x0' || hex === '0x') return '0';
  return BigInt(hex).toString(10);
}

/**
 * Normalize a single Alchemy transfer into the canonical {@link TransferEvent}
 * format used by the package's transfer model.
 *
 * The full Alchemy payload is attached as `_alchemy_raw` so it survives
 * the `rawJson = JSON.stringify(event)` step in the repository normalizer.
 */
export function normalizeAlchemyTransfer(transfer: AlchemyTransfer, chainId: string): TransferEvent {
  return {
    chain_id: chainId,
    block_number: fromHex(transfer.blockNum),
    block_hash: '',
    block_timestamp: transfer.metadata.blockTimestamp,
    transaction_hash: transfer.hash,
    log_index: parseLogIndex(transfer.uniqueId),
    from_address: transfer.from ?? '',
    to_address: transfer.to ?? '',
    token_address: transfer.rawContract.address ?? '',
    value: hexToDecimalString(transfer.rawContract.value),
    asset_category: transfer.category ?? null,
    _alchemy_raw: transfer,
  };
}
