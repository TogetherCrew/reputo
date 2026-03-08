import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAlchemyClient } from '../../../../../src/providers/evm/alchemy/client.js';
import type { AlchemyConfig } from '../../../../../src/providers/evm/alchemy/config.js';
import { NonRetryableProviderError, RetryableProviderError } from '../../../../../src/shared/errors/index.js';

vi.mock('undici', () => ({
  request: vi.fn(),
}));

vi.mock('../../../../../src/shared/logging/index.js', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  }),
}));

const { request: mockRequest } = await import('undici');

function mockResponse(statusCode: number, body: unknown) {
  return {
    statusCode,
    body: { text: () => Promise.resolve(JSON.stringify(body)) },
    headers: {},
  };
}

function createTestConfig(overrides?: Partial<AlchemyConfig>): AlchemyConfig {
  return {
    chains: { ethereum: { rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/test-key' } },
    requestTimeoutMs: 5_000,
    concurrency: 1,
    retry: { maxAttempts: 2, baseDelayMs: 10, maxDelayMs: 50 },
    ...overrides,
  };
}

describe('Alchemy Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createAlchemyClient', () => {
    it('should throw for an unconfigured chain', async () => {
      const client = createAlchemyClient(createTestConfig());

      expect(() => client.jsonRpc('unknown', 'eth_blockNumber', [])).toThrow(NonRetryableProviderError);
    });

    it('should send a JSON-RPC POST request and return the result', async () => {
      (mockRequest as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse(200, { jsonrpc: '2.0', id: 1, result: '0x10' }),
      );

      const client = createAlchemyClient(createTestConfig());
      const result = await client.jsonRpc<string>('ethereum', 'eth_blockNumber', []);

      expect(result).toBe('0x10');
      expect(mockRequest).toHaveBeenCalledWith(
        'https://eth-mainnet.g.alchemy.com/v2/test-key',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('should throw NonRetryableProviderError on 4xx (not 429)', async () => {
      (mockRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse(403, 'Forbidden'));

      const client = createAlchemyClient(createTestConfig());

      await expect(client.jsonRpc('ethereum', 'eth_blockNumber', [])).rejects.toThrow(NonRetryableProviderError);
    });

    it('should retry on 429 and succeed on second attempt', async () => {
      (mockRequest as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(mockResponse(429, 'Rate limited'))
        .mockResolvedValueOnce(mockResponse(200, { jsonrpc: '2.0', id: 2, result: '0x20' }));

      const client = createAlchemyClient(createTestConfig());
      const result = await client.jsonRpc<string>('ethereum', 'eth_blockNumber', []);

      expect(result).toBe('0x20');
      expect(mockRequest).toHaveBeenCalledTimes(2);
    });

    it('should retry on 5xx', async () => {
      (mockRequest as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(mockResponse(500, 'Internal error'))
        .mockResolvedValueOnce(mockResponse(200, { jsonrpc: '2.0', id: 3, result: 42 }));

      const client = createAlchemyClient(createTestConfig());
      const result = await client.jsonRpc<number>('ethereum', 'eth_blockNumber', []);

      expect(result).toBe(42);
    });

    it('should throw NonRetryableProviderError on RPC error with non-retryable code', async () => {
      (mockRequest as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse(200, {
          jsonrpc: '2.0',
          id: 4,
          error: { code: -32600, message: 'Invalid request' },
        }),
      );

      const client = createAlchemyClient(createTestConfig());

      await expect(client.jsonRpc('ethereum', 'eth_blockNumber', [])).rejects.toThrow(NonRetryableProviderError);
    });

    it('should retry on RPC error -32005 (limit exceeded)', async () => {
      (mockRequest as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(
          mockResponse(200, {
            jsonrpc: '2.0',
            id: 5,
            error: { code: -32005, message: 'Limit exceeded' },
          }),
        )
        .mockResolvedValueOnce(mockResponse(200, { jsonrpc: '2.0', id: 6, result: 'ok' }));

      const client = createAlchemyClient(createTestConfig());
      const result = await client.jsonRpc<string>('ethereum', 'eth_blockNumber', []);

      expect(result).toBe('ok');
    });

    it('should throw NonRetryableProviderError when result is missing', async () => {
      (mockRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse(200, { jsonrpc: '2.0', id: 7 }));

      const client = createAlchemyClient(createTestConfig());

      await expect(client.jsonRpc('ethereum', 'eth_blockNumber', [])).rejects.toThrow(NonRetryableProviderError);
    });

    it('should exhaust retries and throw the last error', async () => {
      (mockRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse(500, 'Server error'));

      const client = createAlchemyClient(createTestConfig());

      await expect(client.jsonRpc('ethereum', 'eth_blockNumber', [])).rejects.toThrow(RetryableProviderError);
      expect(mockRequest).toHaveBeenCalledTimes(2);
    });
  });
});
