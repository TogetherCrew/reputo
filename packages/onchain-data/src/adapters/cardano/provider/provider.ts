import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

import type { CardanoAssetTransferProvider } from './contracts.js';
import type { RawCardanoAssetTransaction, RawCardanoTransactionUtxo } from './types.js';

const BLOCKFROST_PAGE_SIZE = 100;

type BlockfrostCardanoClient = {
  assetsTransactions: (
    asset: string,
    pagination: {
      count: number;
      order: 'asc' | 'desc';
      page: number;
    },
  ) => Promise<RawCardanoAssetTransaction[]>;
  txsUtxos: (hash: string) => Promise<RawCardanoTransactionUtxo>;
};

export function createBlockfrostCardanoAssetTransferProvider(input: {
  projectId: string;
  blockfrostApi?: BlockfrostCardanoClient;
}): CardanoAssetTransferProvider<RawCardanoAssetTransaction, RawCardanoTransactionUtxo> {
  const api =
    input.blockfrostApi ??
    createBlockfrostCardanoClient(
      new BlockFrostAPI({
        projectId: input.projectId,
        network: 'mainnet',
      }),
    );

  return {
    async *fetchAssetTransactions(inputWindow) {
      let page = 1;

      for (;;) {
        const items = await api.assetsTransactions(inputWindow.assetIdentifier, {
          count: BLOCKFROST_PAGE_SIZE,
          order: inputWindow.order,
          page,
        });

        if (items.length === 0) {
          break;
        }

        yield {
          items,
        };

        if (items.length < BLOCKFROST_PAGE_SIZE) {
          break;
        }

        page += 1;
      }
    },

    fetchTransactionUtxo(txHash) {
      return api.txsUtxos(txHash);
    },
  };
}

function createBlockfrostCardanoClient(blockfrostApi: BlockFrostAPI): BlockfrostCardanoClient {
  return {
    assetsTransactions: (asset, pagination) => blockfrostApi.assetsTransactions(asset, pagination),
    txsUtxos: (hash) => blockfrostApi.txsUtxos(hash),
  };
}
