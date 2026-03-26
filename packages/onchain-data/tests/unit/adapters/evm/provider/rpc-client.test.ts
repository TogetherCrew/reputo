import { describe, expect, it, vi } from 'vitest';

import { createAlchemyRpcClient } from '../../../../../src/adapters/evm/provider/rpc-client.js';
import type { AlchemyBlockResponse } from '../../../../../src/adapters/evm/provider/types.js';

describe('createAlchemyRpcClient', () => {
  it('retries retryable failures before succeeding', async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const requestFn = vi
      .fn()
      .mockResolvedValueOnce(
        createJsonRpcResponse<AlchemyBlockResponse>({ number: '0x0', hash: '0x0', timestamp: '0x0' }, 429),
      )
      .mockResolvedValueOnce(
        createJsonRpcResponse<AlchemyBlockResponse>({ number: '0x1234', hash: '0xabc', timestamp: '0x1' }),
      );

    const client = createAlchemyRpcClient({
      apiKey: 'test-key',
      requestFn,
      sleep,
      random: () => 0,
    });

    const block = await client.jsonRpc<AlchemyBlockResponse>('ethereum', 'eth_getBlockByNumber', ['finalized', false]);

    expect(block.number).toBe('0x1234');
    expect(requestFn).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
  });

  it('throws non-retryable rpc errors without retrying', async () => {
    const requestFn = vi.fn().mockResolvedValue(createJsonRpcError(-32600, 'Invalid Request'));

    const client = createAlchemyRpcClient({
      apiKey: 'test-key',
      requestFn,
      random: () => 0,
    });

    await expect(client.jsonRpc('ethereum', 'eth_getBlockByNumber', ['finalized', false])).rejects.toThrow(
      'Invalid Request',
    );
    expect(requestFn).toHaveBeenCalledTimes(1);
  });

  it('throws for unsupported chains before issuing a request', async () => {
    const requestFn = vi.fn();
    const client = createAlchemyRpcClient({
      apiKey: 'test-key',
      requestFn,
    });

    await expect(client.jsonRpc('polygon', 'eth_getBlockByNumber', ['finalized', false])).rejects.toThrow(
      'Unsupported Alchemy EVM chain: polygon',
    );
    expect(requestFn).not.toHaveBeenCalled();
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

function createJsonRpcError(code: number, message: string, statusCode = 200) {
  return {
    statusCode,
    body: {
      json: vi.fn().mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code,
          message,
        },
      }),
    },
  };
}
