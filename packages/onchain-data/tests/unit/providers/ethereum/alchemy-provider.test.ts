import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAlchemyEthereumTokenTransferProvider } from '../../../../src/providers/ethereum/alchemy-ethereum-token-transfer-provider.js';

vi.mock('undici', () => ({
  request: vi.fn(),
}));

import { request } from 'undici';

const mockRequest = vi.mocked(request);

function mockJsonRpcResponse<T>(result: T, statusCode = 200) {
  return {
    statusCode,
    body: {
      json: vi.fn().mockResolvedValue({ jsonrpc: '2.0', id: 1, result }),
    },
  };
}

function mockJsonRpcError(code: number, message: string, statusCode = 200) {
  return {
    statusCode,
    body: {
      json: vi.fn().mockResolvedValue({ jsonrpc: '2.0', id: 1, error: { code, message } }),
    },
  };
}

describe('AlchemyEthereumTokenTransferProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getToBlock', () => {
    it('returns finalized block number', async () => {
      mockRequest.mockResolvedValueOnce(
        mockJsonRpcResponse({ number: '0x1234', hash: '0xabc', timestamp: '0x5f5e100' }) as never,
      );

      const provider = createAlchemyEthereumTokenTransferProvider('test-key');
      const block = await provider.getToBlock();

      expect(block).toBe(0x1234);
      expect(mockRequest).toHaveBeenCalledWith(
        'https://eth-mainnet.g.alchemy.com/v2/test-key',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('eth_getBlockByNumber'),
        }),
      );
    });

    it('uses finalized block tag', async () => {
      mockRequest.mockResolvedValueOnce(
        mockJsonRpcResponse({ number: '0x100', hash: '0x', timestamp: '0x0' }) as never,
      );

      const provider = createAlchemyEthereumTokenTransferProvider('test-key');
      await provider.getToBlock();

      const callBody = JSON.parse((mockRequest.mock.calls[0][1] as { body: string }).body);
      expect(callBody.params).toEqual(['finalized', false]);
    });
  });

  describe('fetchTokenTransfers', () => {
    it('yields a batch for a single window with no pagination', async () => {
      mockRequest.mockResolvedValueOnce(
        mockJsonRpcResponse({
          transfers: [
            {
              blockNum: '0x100',
              uniqueId: '0xaaa:log:0x0',
              hash: '0xaaa',
              from: '0x111',
              to: '0x222',
              value: 10,
              asset: 'FET',
              category: 'erc20',
              rawContract: { value: null, address: null, decimal: null },
              metadata: { blockTimestamp: '2024-01-01T00:00:00Z' },
            },
          ],
        }) as never,
      );

      const provider = createAlchemyEthereumTokenTransferProvider('test-key');
      const batches: Array<{ items: unknown[]; lastBlock: number }> = [];

      for await (const batch of provider.fetchTokenTransfers({
        contractAddress: '0xcontract',
        fromBlock: 256,
        toBlock: 512,
      })) {
        batches.push(batch);
      }

      expect(batches).toHaveLength(1);
      expect(batches[0].items).toHaveLength(1);
      expect(batches[0].lastBlock).toBe(512);
    });

    it('handles pagination within a single window', async () => {
      mockRequest
        .mockResolvedValueOnce(
          mockJsonRpcResponse({
            transfers: [
              {
                blockNum: '0x100',
                uniqueId: '0xa:log:0x0',
                hash: '0xa',
                from: '0x1',
                to: '0x2',
                value: 1,
                asset: 'FET',
                category: 'erc20',
                rawContract: { value: null, address: null, decimal: null },
                metadata: { blockTimestamp: '2024-01-01T00:00:00Z' },
              },
            ],
            pageKey: 'page2',
          }) as never,
        )
        .mockResolvedValueOnce(
          mockJsonRpcResponse({
            transfers: [
              {
                blockNum: '0x101',
                uniqueId: '0xb:log:0x0',
                hash: '0xb',
                from: '0x3',
                to: '0x4',
                value: 2,
                asset: 'FET',
                category: 'erc20',
                rawContract: { value: null, address: null, decimal: null },
                metadata: { blockTimestamp: '2024-01-01T00:00:00Z' },
              },
            ],
          }) as never,
        );

      const provider = createAlchemyEthereumTokenTransferProvider('test-key');
      const batches: Array<{ items: unknown[]; lastBlock: number }> = [];

      for await (const batch of provider.fetchTokenTransfers({
        contractAddress: '0xcontract',
        fromBlock: 256,
        toBlock: 512,
      })) {
        batches.push(batch);
      }

      expect(batches).toHaveLength(1);
      expect(batches[0].items).toHaveLength(2);
    });

    it('yields multiple batches for multiple windows', async () => {
      mockRequest
        .mockResolvedValueOnce(mockJsonRpcResponse({ transfers: [] }) as never)
        .mockResolvedValueOnce(mockJsonRpcResponse({ transfers: [] }) as never);

      const provider = createAlchemyEthereumTokenTransferProvider('test-key');
      const batches: Array<{ items: unknown[]; lastBlock: number }> = [];

      for await (const batch of provider.fetchTokenTransfers({
        contractAddress: '0xcontract',
        fromBlock: 0,
        toBlock: 3999,
      })) {
        batches.push(batch);
      }

      expect(batches).toHaveLength(2);
      expect(batches[0].lastBlock).toBe(1999);
      expect(batches[1].lastBlock).toBe(3999);
    });
  });

  describe('error handling', () => {
    it('throws on non-retryable RPC error', async () => {
      mockRequest.mockResolvedValue(mockJsonRpcError(-32600, 'Invalid Request') as never);

      const provider = createAlchemyEthereumTokenTransferProvider('test-key');
      await expect(provider.getToBlock()).rejects.toThrow('Invalid Request');
    });
  });
});
