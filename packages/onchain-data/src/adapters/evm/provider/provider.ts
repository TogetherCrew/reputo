import type { EvmAssetTransferProvider } from './contracts.js';
import type { AlchemyRequestFn, AlchemyRpcClient, AlchemySleepFn } from './rpc-client.js';
import { createAlchemyRpcClient } from './rpc-client.js';
import type { AlchemyAssetTransfer, AlchemyAssetTransfersResponse, AlchemyBlockResponse } from './types.js';

const ALCHEMY_PAGE_SIZE = 1000;

export function createAlchemyEvmAssetTransferProvider(input: {
  apiKey: string;
  requestFn?: AlchemyRequestFn;
  sleep?: AlchemySleepFn;
  random?: () => number;
  rpcClient?: AlchemyRpcClient;
}): EvmAssetTransferProvider<AlchemyAssetTransfer> {
  const rpcClient =
    input.rpcClient ??
    createAlchemyRpcClient({
      apiKey: input.apiKey,
      requestFn: input.requestFn,
      sleep: input.sleep,
      random: input.random,
    });

  async function fetchTransferPage(inputPage: {
    chain: string;
    assetIdentifier: string;
    fromBlock: string;
    toBlock: string;
    pageKey?: string;
  }): Promise<{ items: AlchemyAssetTransfer[]; lastBlock: string; nextPageKey?: string }> {
    const result = await rpcClient.jsonRpc<AlchemyAssetTransfersResponse>(
      inputPage.chain,
      'alchemy_getAssetTransfers',
      [
        {
          fromBlock: inputPage.fromBlock,
          toBlock: inputPage.toBlock,
          contractAddresses: [inputPage.assetIdentifier],
          category: ['erc20'],
          excludeZeroValue: false,
          order: 'asc',
          maxCount: toHex(ALCHEMY_PAGE_SIZE),
          withMetadata: true,
          ...(inputPage.pageKey ? { pageKey: inputPage.pageKey } : {}),
        },
      ],
    );

    const lastBlock =
      result.transfers.length > 0 ? result.transfers[result.transfers.length - 1].blockNum : inputPage.toBlock;

    return {
      items: result.transfers,
      lastBlock,
      nextPageKey: result.pageKey,
    };
  }

  return {
    async getFinalizedBlock(chain: string): Promise<string> {
      const block = await rpcClient.jsonRpc<AlchemyBlockResponse>(chain, 'eth_getBlockByNumber', ['finalized', false]);
      return block.number;
    },

    async *fetchAssetTransfers(inputPage) {
      let pageKey: string | undefined;

      for (;;) {
        const page = await fetchTransferPage({
          ...inputPage,
          pageKey,
        });

        yield {
          items: page.items,
          lastBlock: page.lastBlock,
        };

        if (!page.nextPageKey) {
          break;
        }

        pageKey = page.nextPageKey;
      }
    },
  };
}

function toHex(value: number): string {
  return `0x${value.toString(16)}`;
}
