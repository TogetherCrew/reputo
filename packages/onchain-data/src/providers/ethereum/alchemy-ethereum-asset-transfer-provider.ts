import { request } from 'undici';
import type { AssetTransferEntity } from '../../db/schema.js';
import type { AssetKey } from '../../shared/index.js';
import type { AlchemyAssetTransfer, AlchemyAssetTransfersResponse, AlchemyBlockResponse } from './alchemy-types.js';
import { normalizeAlchemyEthereumTransfer } from './normalize-alchemy-transfer.js';

const ALCHEMY_PAGE_SIZE = 1000;
const MAX_RETRY_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30_000;
const REQUEST_TIMEOUT_MS = 30_000;

type RawTransferPage = {
  items: AlchemyAssetTransfer[];
  lastBlock: string;
  pageKey?: string;
};

export interface AlchemyEthereumAssetTransferProvider {
  getToBlock(): Promise<string>;
  fetchAssetTransfers(input: {
    assetKey: AssetKey;
    assetIdentifier: string;
    fromBlock: string;
    toBlock: string;
  }): AsyncGenerator<{ items: AssetTransferEntity[]; lastBlock: string }>;
}

export function createAlchemyEthereumAssetTransferProvider(
  alchemyApiKey: string,
): AlchemyEthereumAssetTransferProvider {
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

  async function fetchPage(input: {
    assetIdentifier: string;
    fromBlock: string;
    toBlock: string;
    pageKey?: string;
  }): Promise<RawTransferPage> {
    const result = await jsonRpc<AlchemyAssetTransfersResponse>('alchemy_getAssetTransfers', [
      {
        fromBlock: input.fromBlock,
        toBlock: input.toBlock,
        contractAddresses: [input.assetIdentifier],
        category: ['erc20'],
        excludeZeroValue: false,
        order: 'asc',
        maxCount: toHex(ALCHEMY_PAGE_SIZE),
        withMetadata: true,
        ...(input.pageKey ? { pageKey: input.pageKey } : {}),
      },
    ]);

    const lastBlock =
      result.transfers.length > 0 ? result.transfers[result.transfers.length - 1].blockNum : input.toBlock;

    return {
      items: result.transfers,
      lastBlock,
      pageKey: result.pageKey,
    };
  }

  return {
    async getToBlock(): Promise<string> {
      const block = await jsonRpc<AlchemyBlockResponse>('eth_getBlockByNumber', ['finalized', false]);
      return block.number;
    },

    async *fetchAssetTransfers(input) {
      const { assetKey, assetIdentifier, fromBlock, toBlock } = input;
      let current = await fetchPage({
        assetIdentifier,
        fromBlock,
        toBlock,
      });

      for (;;) {
        const nextPromise = current.pageKey
          ? fetchPage({
              assetIdentifier,
              fromBlock,
              toBlock,
              pageKey: current.pageKey,
            })
          : null;

        const items: AssetTransferEntity[] = current.items.map((raw) =>
          normalizeAlchemyEthereumTransfer({
            assetKey,
            transfer: raw,
          }),
        );
        yield { items, lastBlock: current.lastBlock };

        if (!nextPromise) break;
        current = await nextPromise;
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
