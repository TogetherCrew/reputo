import { describe, expect, it, vi } from 'vitest';
import type { AlchemyClient } from '../../../../../src/providers/evm/alchemy/client.js';
import { fetchErc20Transfers } from '../../../../../src/providers/evm/alchemy/transfers.js';
import type {
  AlchemyAssetTransfersResult,
  AlchemyBlockResult,
} from '../../../../../src/providers/evm/alchemy/types.js';

function mockAlchemyTransfer(overrides?: Record<string, unknown>) {
  return {
    blockNum: '0x100',
    uniqueId: '0xtx1:log:0',
    hash: '0xtx1',
    from: '0xsender',
    to: '0xreceiver',
    value: 1.0,
    erc721TokenId: null,
    erc1155Metadata: null,
    tokenId: null,
    asset: 'FET',
    category: 'erc20',
    rawContract: { value: '0xde0b6b3a7640000', address: '0xtoken', decimal: '0x12' },
    metadata: { blockTimestamp: '2024-01-01T00:00:00.000Z' },
    ...overrides,
  };
}

function createMockAlchemyClient(finalizedBlock: number, pages: AlchemyAssetTransfersResult[]): AlchemyClient {
  let pageIndex = 0;

  return {
    jsonRpc: vi.fn((_chain: string, method: string) => {
      if (method === 'eth_getBlockByNumber') {
        return Promise.resolve({
          number: `0x${finalizedBlock.toString(16)}`,
          hash: '0xblockhash',
          timestamp: '0x0',
        } satisfies AlchemyBlockResult);
      }
      if (method === 'alchemy_getAssetTransfers') {
        const page = pages[pageIndex] ?? { transfers: [] };
        pageIndex++;
        return Promise.resolve(page);
      }
      return Promise.reject(new Error(`Unexpected method: ${method}`));
    }),
  };
}

describe('fetchErc20Transfers', () => {
  const baseInput = {
    chain: 'ethereum',
    tokenContractAddress: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
    fromBlock: 0,
    requestedToBlock: 20_000_000,
  };

  it('should cap toBlock to the finalized block number', async () => {
    const client = createMockAlchemyClient(18_000_000, [{ transfers: [] }]);

    const result = await fetchErc20Transfers(client, baseInput);

    expect(result.effectiveToBlock).toBe(18_000_000);
    expect(client.jsonRpc).toHaveBeenCalledWith('ethereum', 'alchemy_getAssetTransfers', [
      expect.objectContaining({
        toBlock: '0x112a880',
      }),
    ]);
  });

  it('should use requestedToBlock when it is below the finalized block', async () => {
    const client = createMockAlchemyClient(20_000_000, [{ transfers: [] }]);
    const input = { ...baseInput, requestedToBlock: 15_000_000 };

    const result = await fetchErc20Transfers(client, input);

    expect(result.effectiveToBlock).toBe(15_000_000);
  });

  it('should return empty transfers when fromBlock > effectiveToBlock', async () => {
    const client = createMockAlchemyClient(100, []);
    const input = { ...baseInput, fromBlock: 200, requestedToBlock: 300 };

    const result = await fetchErc20Transfers(client, input);

    expect(result.transfers).toHaveLength(0);
    expect(result.effectiveToBlock).toBe(100);
  });

  it('should normalize transfers from a single page', async () => {
    const transfers = [
      mockAlchemyTransfer({ hash: '0xtx1', uniqueId: '0xtx1:log:0' }),
      mockAlchemyTransfer({ hash: '0xtx2', uniqueId: '0xtx2:log:0' }),
    ];
    const client = createMockAlchemyClient(20_000_000, [{ transfers }]);

    const result = await fetchErc20Transfers(client, baseInput);

    expect(result.transfers).toHaveLength(2);
    expect(result.transfers[0].transaction_hash).toBe('0xtx1');
    expect(result.transfers[1].transaction_hash).toBe('0xtx2');
    expect(result.transfers[0].chain_id).toBe('1');
  });

  it('should paginate until pageKey is exhausted', async () => {
    const page1: AlchemyAssetTransfersResult = {
      transfers: [mockAlchemyTransfer({ hash: '0xtx1', uniqueId: '0xtx1:log:0' })],
      pageKey: 'page2key',
    };
    const page2: AlchemyAssetTransfersResult = {
      transfers: [mockAlchemyTransfer({ hash: '0xtx2', uniqueId: '0xtx2:log:0' })],
      pageKey: 'page3key',
    };
    const page3: AlchemyAssetTransfersResult = {
      transfers: [mockAlchemyTransfer({ hash: '0xtx3', uniqueId: '0xtx3:log:0' })],
    };

    const client = createMockAlchemyClient(20_000_000, [page1, page2, page3]);

    const result = await fetchErc20Transfers(client, baseInput);

    expect(result.transfers).toHaveLength(3);
    expect(client.jsonRpc).toHaveBeenCalledTimes(4);
  });

  it('should pass correct params to alchemy_getAssetTransfers', async () => {
    const client = createMockAlchemyClient(20_000_000, [{ transfers: [] }]);

    await fetchErc20Transfers(client, baseInput);

    expect(client.jsonRpc).toHaveBeenCalledWith('ethereum', 'alchemy_getAssetTransfers', [
      {
        fromBlock: '0x0',
        toBlock: expect.any(String),
        contractAddresses: ['0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85'],
        category: ['erc20'],
        excludeZeroValue: false,
        maxCount: '0x3E8',
        order: 'asc',
      },
    ]);
  });

  it('should pass pageKey on subsequent requests', async () => {
    const page1: AlchemyAssetTransfersResult = {
      transfers: [mockAlchemyTransfer()],
      pageKey: 'next-page',
    };
    const page2: AlchemyAssetTransfersResult = { transfers: [] };

    const client = createMockAlchemyClient(20_000_000, [page1, page2]);

    await fetchErc20Transfers(client, baseInput);

    const calls = (client.jsonRpc as ReturnType<typeof vi.fn>).mock.calls;
    const transferCalls = calls.filter((c: [string, string, unknown[]]) => c[1] === 'alchemy_getAssetTransfers');

    expect(transferCalls[0][2][0]).not.toHaveProperty('pageKey');
    expect(transferCalls[1][2][0]).toHaveProperty('pageKey', 'next-page');
  });

  it('should throw for unknown chain', async () => {
    const client = createMockAlchemyClient(100, []);
    const input = { ...baseInput, chain: 'unknown-chain' };

    await expect(fetchErc20Transfers(client, input)).rejects.toThrow('Unknown chain');
  });

  it('should preserve raw payload in normalized events', async () => {
    const raw = mockAlchemyTransfer();
    const client = createMockAlchemyClient(20_000_000, [{ transfers: [raw] }]);

    const result = await fetchErc20Transfers(client, baseInput);

    expect(result.transfers[0]._alchemy_raw).toEqual(raw);
  });
});
