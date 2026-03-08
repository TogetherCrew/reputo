import type { TransferEvent } from '../../../resources/transfers/types.js';
import type { AlchemyClient } from './client.js';
import { CHAIN_IDS } from './config.js';
import { getFinalizedBlockNumber, toHex } from './finality.js';
import { normalizeAlchemyTransfer } from './normalize.js';
import type { AlchemyAssetTransfersParams, AlchemyAssetTransfersResult } from './types.js';

/** Alchemy caps each page at 1 000 results (0x3E8) */
const MAX_COUNT_HEX = '0x3E8';

/**
 * Fetch all ERC-20 transfers for a token contract in a block range.
 *
 * 1. Resolves the finalized block and caps the range.
 * 2. Pages through `alchemy_getAssetTransfers` until `pageKey` is exhausted.
 * 3. Normalizes every result into a canonical {@link TransferEvent}.
 */
export async function fetchErc20Transfers(
  client: AlchemyClient,
  input: {
    chain: string;
    tokenContractAddress: string;
    fromBlock: number;
    requestedToBlock: number;
  },
): Promise<{ transfers: TransferEvent[]; effectiveToBlock: number }> {
  const { chain, tokenContractAddress, fromBlock, requestedToBlock } = input;

  const chainId = CHAIN_IDS[chain];
  if (!chainId) {
    throw new Error(`Unknown chain: "${chain}". No chain ID mapping found.`);
  }

  const finalizedBlock = await getFinalizedBlockNumber(client, chain);
  const effectiveToBlock = Math.min(requestedToBlock, finalizedBlock);

  if (fromBlock > effectiveToBlock) {
    return { transfers: [], effectiveToBlock };
  }

  const allTransfers: TransferEvent[] = [];
  let pageKey: string | undefined;

  do {
    const params: AlchemyAssetTransfersParams = {
      fromBlock: toHex(fromBlock),
      toBlock: toHex(effectiveToBlock),
      contractAddresses: [tokenContractAddress],
      category: ['erc20'],
      excludeZeroValue: false,
      maxCount: MAX_COUNT_HEX,
      order: 'asc',
    };

    if (pageKey) {
      params.pageKey = pageKey;
    }

    const result = await client.jsonRpc<AlchemyAssetTransfersResult>(chain, 'alchemy_getAssetTransfers', [params]);

    for (const transfer of result.transfers) {
      allTransfers.push(normalizeAlchemyTransfer(transfer, chainId));
    }

    pageKey = result.pageKey;
  } while (pageKey);

  return { transfers: allTransfers, effectiveToBlock };
}
