import type { EvmAssetTransferRow } from '@reputo/onchain-data';

import type { OrderedTransferEvent, ResourceId } from '../types.js';

function normalizeHexBlock(block: string): string {
  return `0x${BigInt(block).toString(16)}`;
}

export function normalizeEvmTransfers(
  rows: EvmAssetTransferRow[],
  resourceId: ResourceId,
  stakingAddresses: Set<string>,
): OrderedTransferEvent[] {
  const seen = new Set<string>();
  const events: OrderedTransferEvent[] = [];

  for (const row of rows) {
    const dedupeId = row.unique_id;
    if (seen.has(dedupeId)) continue;
    seen.add(dedupeId);

    const amount = row.value ?? 0;
    const fromAddress = row.from_address || null;
    const toAddress = row.to_address || null;

    const isStaking =
      (fromAddress != null && stakingAddresses.has(fromAddress.toLowerCase())) ||
      (toAddress != null && stakingAddresses.has(toAddress.toLowerCase()));

    const blockTimestamp = row.metadata?.blockTimestamp ?? null;

    events.push({
      resourceId,
      blockOrdinal: normalizeHexBlock(row.block_num),
      transactionHash: row.hash,
      logIndex: 0,
      fromAddress,
      toAddress,
      amount,
      blockTimestamp: blockTimestamp ?? null,
      isStaking,
    });
  }

  return events;
}
