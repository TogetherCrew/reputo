import { describe, expect, it, vi } from 'vitest';

import { createAlchemyEvmAssetTransferProvider } from '../../../../../src/adapters/evm/provider/provider.js';
import type {
  AlchemyAssetTransfersResponse,
  AlchemyBlockResponse,
} from '../../../../../src/adapters/evm/provider/types.js';
import { createMockAlchemyAssetTransfer } from '../../../../utils/mock-helpers.js';

describe('createAlchemyEvmAssetTransferProvider', () => {
  it('uses the finalized block tag when fetching the latest block', async () => {
    const requestFn = vi
      .fn()
      .mockResolvedValue(
        createJsonRpcResponse<AlchemyBlockResponse>({ number: '0x1234', hash: '0xabc', timestamp: '0x1' }),
      );

    const provider = createAlchemyEvmAssetTransferProvider({
      apiKey: 'test-key',
      requestFn,
    });

    const block = await provider.getFinalizedBlock('ethereum');

    expect(block).toBe('0x1234');
    expect(requestFn).toHaveBeenCalledWith(
      'https://eth-mainnet.g.alchemy.com/v2/test-key',
      expect.objectContaining({
        method: 'POST',
      }),
    );

    const body = JSON.parse((requestFn.mock.calls[0][1] as { body: string }).body);
    expect(body.method).toBe('eth_getBlockByNumber');
    expect(body.params).toEqual(['finalized', false]);
  });

  it('yields raw transfer pages without normalization', async () => {
    const firstTransfer = createMockAlchemyAssetTransfer({
      uniqueId: '0xfirst:log:0x0',
      blockNum: '0x100',
    });
    const secondTransfer = createMockAlchemyAssetTransfer({
      uniqueId: '0xsecond:log:0x1',
      blockNum: '0x101',
      from: '0xAAAA000000000000000000000000000000000001',
    });

    const requestFn = vi
      .fn()
      .mockResolvedValueOnce(
        createJsonRpcResponse<AlchemyAssetTransfersResponse>({
          transfers: [firstTransfer],
          pageKey: 'page-2',
        }),
      )
      .mockResolvedValueOnce(
        createJsonRpcResponse<AlchemyAssetTransfersResponse>({
          transfers: [secondTransfer],
        }),
      );

    const provider = createAlchemyEvmAssetTransferProvider({
      apiKey: 'test-key',
      requestFn,
    });

    const pages = [];
    for await (const page of provider.fetchAssetTransfers({
      chain: 'ethereum',
      assetIdentifier: '0xcontract',
      fromBlock: '0x100',
      toBlock: '0x200',
    })) {
      pages.push(page);
    }

    expect(pages).toEqual([
      {
        items: [firstTransfer],
        lastBlock: '0x100',
      },
      {
        items: [secondTransfer],
        lastBlock: '0x101',
      },
    ]);

    const firstBody = JSON.parse((requestFn.mock.calls[0][1] as { body: string }).body);
    expect(firstBody.method).toBe('alchemy_getAssetTransfers');
    expect(firstBody.params[0]).toMatchObject({
      fromBlock: '0x100',
      toBlock: '0x200',
      contractAddresses: ['0xcontract'],
      withMetadata: true,
      category: ['erc20'],
      excludeZeroValue: false,
      order: 'asc',
      maxCount: '0x3e8',
    });
  });
});

function createJsonRpcResponse<T>(result: T, statusCode = 200) {
  return {
    statusCode,
    body: {
      json: vi.fn().mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result,
      }),
    },
  };
}
