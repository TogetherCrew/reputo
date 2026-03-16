import type { AssetTransferEntity } from '../../db/schema.js';
import { type AssetKey, normalizeEvmAddress, normalizeHexBlock } from '../../shared/index.js';
import type { AlchemyAssetTransfer } from './alchemy-types.js';

/** Parses log index from Alchemy uniqueId e.g. "0xhash:log:0x0" -> 0, ":log:0xa" -> 10. */
export function parseLogIndex(uniqueId: string): number {
  const logPart = uniqueId.split(':log:')[1];
  if (logPart == null) return 0;
  return parseInt(logPart, 16) || 0;
}

/**
 * Normalizes a single Alchemy transfer to the shape of AssetTransferSchema (AssetTransferEntity).
 * Block and timestamp are numbers (block number as integer, block_timestamp_unix as Unix seconds).
 */
export function normalizeAlchemyEthereumTransfer(input: {
  assetKey: AssetKey;
  transfer: AlchemyAssetTransfer;
}): AssetTransferEntity {
  const logIndex = parseLogIndex(input.transfer.uniqueId);
  const blockNum = Number(BigInt(normalizeHexBlock(input.transfer.blockNum)));
  const blockTimestamp = input.transfer.metadata?.blockTimestamp;
  const block_timestamp_unix = blockTimestamp != null ? Math.floor(new Date(blockTimestamp).getTime() / 1000) : null;

  return {
    asset_key: input.assetKey,
    block_number: blockNum,
    transaction_hash: input.transfer.hash,
    log_index: logIndex,
    from_address: input.transfer.from ? normalizeEvmAddress(input.transfer.from) : null,
    to_address: input.transfer.to ? normalizeEvmAddress(input.transfer.to) : null,
    amount: String(input.transfer.value ?? '0'),
    block_timestamp_unix,
  };
}
