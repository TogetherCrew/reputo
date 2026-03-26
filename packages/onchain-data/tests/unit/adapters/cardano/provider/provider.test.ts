import { describe, expect, it, vi } from 'vitest';

import { createBlockfrostCardanoAssetTransferProvider } from '../../../../../src/adapters/cardano/provider/provider.js';
import {
  createMockBlockfrostAssetTransaction,
  createMockBlockfrostTransactionUtxo,
  FET_CARDANO_IDENTIFIER,
} from '../../../../utils/mock-helpers.js';

describe('createBlockfrostCardanoAssetTransferProvider', () => {
  it('pages raw asset transactions with the requested order', async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) =>
      createMockBlockfrostAssetTransaction({
        tx_hash: `tx-${index}`,
        tx_index: index,
        block_height: 1_000 + index,
        block_time: 1_700_000_000 + index,
      }),
    );
    const secondPage = [
      createMockBlockfrostAssetTransaction({
        tx_hash: 'tx-last',
        tx_index: 100,
        block_height: 1_100,
        block_time: 1_700_000_100,
      }),
    ];
    const blockfrostApi = {
      assetsTransactions: vi.fn().mockResolvedValueOnce(firstPage).mockResolvedValueOnce(secondPage),
      txsUtxos: vi.fn(),
    };

    const provider = createBlockfrostCardanoAssetTransferProvider({
      projectId: 'test-project',
      blockfrostApi,
    });

    const pages = [];
    for await (const page of provider.fetchAssetTransactions({
      assetIdentifier: FET_CARDANO_IDENTIFIER,
      order: 'desc',
    })) {
      pages.push(page);
    }

    expect(pages).toEqual([{ items: firstPage }, { items: secondPage }]);
    expect(blockfrostApi.assetsTransactions).toHaveBeenNthCalledWith(1, FET_CARDANO_IDENTIFIER, {
      count: 100,
      order: 'desc',
      page: 1,
    });
    expect(blockfrostApi.assetsTransactions).toHaveBeenNthCalledWith(2, FET_CARDANO_IDENTIFIER, {
      count: 100,
      order: 'desc',
      page: 2,
    });
  });

  it('returns raw transaction utxos as-is', async () => {
    const utxo = createMockBlockfrostTransactionUtxo();
    const blockfrostApi = {
      assetsTransactions: vi.fn(),
      txsUtxos: vi.fn().mockResolvedValue(utxo),
    };

    const provider = createBlockfrostCardanoAssetTransferProvider({
      projectId: 'test-project',
      blockfrostApi,
    });

    await expect(provider.fetchTransactionUtxo(utxo.hash)).resolves.toEqual(utxo);
    expect(blockfrostApi.txsUtxos).toHaveBeenCalledWith(utxo.hash);
  });
});
