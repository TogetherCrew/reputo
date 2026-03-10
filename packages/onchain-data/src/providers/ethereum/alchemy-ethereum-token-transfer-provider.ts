import { request } from 'undici';
import type { AlchemyAssetTransfer, AlchemyAssetTransfersResponse, AlchemyBlockResponse } from './alchemy-types.js';

const BLOCK_WINDOW_SIZE = 2000;
const MAX_RETRY_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30_000;
const REQUEST_TIMEOUT_MS = 30_000;

export interface AlchemyEthereumTokenTransferProvider {
  getToBlock(): Promise<number>;
  fetchTokenTransfers(input: { contractAddress: string; fromBlock: number; toBlock: number }): AsyncGenerator<{
    items: AlchemyAssetTransfer[];
    lastBlock: number;
  }>;
}

export function createAlchemyEthereumTokenTransferProvider(
  alchemyApiKey: string,
): AlchemyEthereumTokenTransferProvider {
  const rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;

  async function jsonRpc<T>(method: string, params: unknown[]): Promise<T> {
    return withRetry(async () => {
      const { statusCode, body } = await request(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        headersTimeout: REQUEST_TIMEOUT_MS,
        bodyTimeout: REQUEST_TIMEOUT_MS,
      });

      const data = (await body.json()) as {
        result?: T;
        error?: { code: number; message: string };
      };

      if (statusCode === 429 || (statusCode >= 500 && statusCode < 600)) {
        throw new RetryableError(`HTTP ${statusCode}`);
      }

      if (statusCode < 200 || statusCode >= 300) {
        throw new NonRetryableError(`HTTP ${statusCode}`);
      }

      if (data.error) {
        const retryableCodes = [-32005, -32603];
        if (retryableCodes.includes(data.error.code)) {
          throw new RetryableError(`RPC error ${data.error.code}: ${data.error.message}`);
        }
        throw new NonRetryableError(`RPC error ${data.error.code}: ${data.error.message}`);
      }

      if (data.result === undefined || data.result === null) {
        throw new NonRetryableError(`No result in JSON-RPC response for ${method}`);
      }

      return data.result;
    });
  }

  return {
    async getToBlock(): Promise<number> {
      const block = await jsonRpc<AlchemyBlockResponse>('eth_getBlockByNumber', ['finalized', false]);
      return Number(block.number);
    },

    async *fetchTokenTransfers(input) {
      for (let windowStart = input.fromBlock; windowStart <= input.toBlock; windowStart += BLOCK_WINDOW_SIZE) {
        const windowEnd = Math.min(windowStart + BLOCK_WINDOW_SIZE - 1, input.toBlock);
        const items: AlchemyAssetTransfer[] = [];
        let pageKey: string | undefined;

        do {
          const result = await jsonRpc<AlchemyAssetTransfersResponse>('alchemy_getAssetTransfers', [
            {
              fromBlock: toHex(windowStart),
              toBlock: toHex(windowEnd),
              contractAddresses: [input.contractAddress],
              category: ['erc20'],
              excludeZeroValue: false,
              order: 'asc',
              maxCount: toHex(1000),
              ...(pageKey ? { pageKey } : {}),
            },
          ]);
          items.push(...result.transfers);
          pageKey = result.pageKey;
        } while (pageKey);

        yield { items, lastBlock: windowEnd };
      }
    },
  };
}

function toHex(n: number): string {
  return `0x${n.toString(16)}`;
}

class RetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetryableError';
  }
}

class NonRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetryableError';
  }
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (error instanceof NonRetryableError) {
        throw error;
      }
      const retryable = error instanceof RetryableError || (error instanceof Error && isTransientNetworkError(error));
      if (attempt < MAX_RETRY_ATTEMPTS && retryable) {
        const delay = Math.min(BASE_RETRY_DELAY_MS * 2 ** (attempt - 1), MAX_RETRY_DELAY_MS);
        const jitter = Math.random() * delay * 0.1;
        await new Promise((resolve) => setTimeout(resolve, delay + jitter));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

function isTransientNetworkError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('timeout') ||
    message.includes('econnreset') ||
    message.includes('econnrefused') ||
    message.includes('socket hang up')
  );
}
