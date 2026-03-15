import type { AssetKey, AssetTransferReadRepository, ChainPositionCursor } from '@reputo/onchain-data';

import { type OrderedTransferEvent, toTransferEvent } from '../types.js';

export type TransferPage = {
  items: OrderedTransferEvent[];
  nextCursor: ChainPositionCursor | null;
};

export async function loadTransferPageForWallets(input: {
  repo: AssetTransferReadRepository;
  assetKey: AssetKey;
  walletAddresses: string[];
  limit: number;
  cursor?: ChainPositionCursor;
}): Promise<TransferPage> {
  if (input.walletAddresses.length === 0) {
    return { items: [], nextCursor: null };
  }

  const page = await input.repo.findTransfersByAddresses({
    assetKey: input.assetKey,
    addresses: input.walletAddresses,
    limit: input.limit,
    cursor: input.cursor,
  });

  const byId = new Map<string, OrderedTransferEvent>();
  for (const record of page.items) {
    const event = toTransferEvent(record, input.assetKey);
    const id = `${event.assetKey}:${event.transactionHash}:${event.logIndex}`;
    if (!byId.has(id)) byId.set(id, event);
  }

  return {
    items: [...byId.values()],
    nextCursor: page.nextCursor,
  };
}
