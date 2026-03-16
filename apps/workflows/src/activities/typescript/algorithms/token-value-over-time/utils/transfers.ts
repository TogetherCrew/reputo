import { type AssetKey, type AssetTransferReadRepository, ONCHAIN_ASSET_KEYS } from '@reputo/onchain-data';

import { type OrderedTransferEvent, toTransferEvent } from '../types.js';

export type TransferPage = {
  items: OrderedTransferEvent[];
  hasMore: boolean;
};

export async function loadTransferPageForWallets(input: {
  repo: AssetTransferReadRepository;
  assetKey: AssetKey;
  walletAddresses: string[];
  page: number;
  limit: number;
}): Promise<TransferPage> {
  if (input.walletAddresses.length === 0) {
    return { items: [], hasMore: false };
  }

  const assetId = ONCHAIN_ASSET_KEYS.indexOf(input.assetKey);
  if (assetId === -1) {
    throw new Error(`Unsupported asset key: ${input.assetKey}`);
  }

  const rows = await input.repo.findTransfersByAddresses({
    assetId,
    addresses: input.walletAddresses,
    page: input.page,
    limit: input.limit,
    orderBy: 'time_asc',
  });

  const byId = new Map<string, OrderedTransferEvent>();
  for (const record of rows) {
    const event = toTransferEvent(record, input.assetKey);
    const id = `${event.assetKey}:${event.transactionHash}:${event.logIndex}`;
    if (!byId.has(id)) byId.set(id, event);
  }

  return {
    items: [...byId.values()],
    hasMore: rows.length === input.limit,
  };
}
