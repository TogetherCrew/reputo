import { request } from 'undici';

import type { JsonRpcResponse } from './types.js';

const MAX_RETRY_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30_000;
const REQUEST_TIMEOUT_MS = 30_000;

const ALCHEMY_NETWORKS = {
  ethereum: 'eth-mainnet',
} as const;

export type AlchemyRequestFn = (
  url: string,
  options: {
    method: string;
    headers: Record<string, string>;
    body: string;
    headersTimeout: number;
    bodyTimeout: number;
  },
) => Promise<{
  statusCode: number;
  body: {
    json(): Promise<unknown>;
  };
}>;

export type AlchemySleepFn = (ms: number) => Promise<void>;

export type AlchemyRpcClient = {
  jsonRpc<T>(chain: string, method: string, params: unknown[]): Promise<T>;
};

export function createAlchemyRpcClient(input: {
  apiKey: string;
  requestFn?: AlchemyRequestFn;
  sleep?: AlchemySleepFn;
  random?: () => number;
}): AlchemyRpcClient {
  const requestFn = input.requestFn ?? request;
  const sleep = input.sleep ?? defaultSleep;
  const random = input.random ?? Math.random;

  return {
    async jsonRpc<T>(chain: string, method: string, params: unknown[]): Promise<T> {
      const rpcUrl = resolveAlchemyRpcUrl(chain, input.apiKey);

      return withRetry(
        async () => {
          const { statusCode, body } = await requestFn(rpcUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method,
              params,
            }),
            headersTimeout: REQUEST_TIMEOUT_MS,
            bodyTimeout: REQUEST_TIMEOUT_MS,
          });

          const payload = (await body.json()) as JsonRpcResponse<T>;

          if (statusCode === 429 || (statusCode >= 500 && statusCode < 600)) {
            throw new RetryableError(`HTTP ${statusCode}`);
          }

          if (statusCode < 200 || statusCode >= 300) {
            throw new NonRetryableError(`HTTP ${statusCode}`);
          }

          if (payload.error) {
            const retryableCodes = new Set([-32005, -32603]);

            if (retryableCodes.has(payload.error.code)) {
              throw new RetryableError(`RPC error ${payload.error.code}: ${payload.error.message}`);
            }

            throw new NonRetryableError(`RPC error ${payload.error.code}: ${payload.error.message}`);
          }

          if (payload.result == null) {
            throw new NonRetryableError(`No result in JSON-RPC response for ${method}`);
          }

          return payload.result;
        },
        { sleep, random },
      );
    },
  };
}

function resolveAlchemyRpcUrl(chain: string, apiKey: string): string {
  const normalizedChain = chain.toLowerCase() as keyof typeof ALCHEMY_NETWORKS;
  const network = ALCHEMY_NETWORKS[normalizedChain];

  if (!network) {
    throw new Error(`Unsupported Alchemy EVM chain: ${chain}`);
  }

  return `https://${network}.g.alchemy.com/v2/${apiKey}`;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  input: {
    sleep: AlchemySleepFn;
    random: () => number;
  },
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
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
        const jitter = input.random() * delay * 0.1;
        await input.sleep(delay + jitter);
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

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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
