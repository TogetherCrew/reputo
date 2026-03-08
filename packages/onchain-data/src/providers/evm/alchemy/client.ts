import pLimit from 'p-limit';
import type { Logger } from 'pino';
import { request } from 'undici';
import { NonRetryableProviderError, RetryableProviderError } from '../../../shared/errors/index.js';
import { createLogger } from '../../../shared/logging/index.js';
import type { AlchemyConfig } from './config.js';
import type { JsonRpcResponse } from './types.js';

const PROVIDER_NAME = 'alchemy';

/** Alchemy JSON-RPC client bound to a resolved configuration */
export type AlchemyClient = {
  jsonRpc: <T>(chain: string, method: string, params: unknown[]) => Promise<T>;
};

let rpcRequestId = 0;

function isRetryableStatusCode(status: number): boolean {
  return status === 429 || status >= 500;
}

function isRetryableRpcErrorCode(code: number): boolean {
  return code === -32005 || code === -32603;
}

function calculateDelay(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  const exponentialDelay = baseDelayMs * 2 ** attempt;
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);
  const jitter = Math.random() * cappedDelay * 0.5;
  return cappedDelay + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('timeout') ||
    msg.includes('econnreset') ||
    msg.includes('econnrefused') ||
    msg.includes('socket hang up') ||
    msg.includes('network')
  );
}

async function executeJsonRpc<T>(
  config: AlchemyConfig,
  logger: Logger,
  rpcUrl: string,
  method: string,
  params: unknown[],
): Promise<T> {
  const { maxAttempts, baseDelayMs, maxDelayMs } = config.retry;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const id = ++rpcRequestId;
    const startTime = Date.now();

    try {
      logger.debug({
        msg: 'RPC request attempt',
        method,
        attempt: attempt + 1,
        maxAttempts,
        id,
      });

      const response = await request(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
        headersTimeout: config.requestTimeoutMs,
        bodyTimeout: config.requestTimeoutMs,
      });

      const duration = Date.now() - startTime;
      const body = await response.body.text();

      logger.debug({
        msg: 'RPC response',
        method,
        statusCode: response.statusCode,
        duration,
        attempt: attempt + 1,
        id,
      });

      if (response.statusCode >= 400) {
        const ErrorClass = isRetryableStatusCode(response.statusCode)
          ? RetryableProviderError
          : NonRetryableProviderError;
        throw new ErrorClass(PROVIDER_NAME, `HTTP ${response.statusCode}: ${body}`);
      }

      const parsed: JsonRpcResponse<T> = JSON.parse(body);

      if (parsed.error) {
        const ErrorClass = isRetryableRpcErrorCode(parsed.error.code)
          ? RetryableProviderError
          : NonRetryableProviderError;
        throw new ErrorClass(PROVIDER_NAME, `RPC error ${parsed.error.code}: ${parsed.error.message}`);
      }

      if (parsed.result === undefined) {
        throw new NonRetryableProviderError(PROVIDER_NAME, 'RPC response missing result');
      }

      return parsed.result;
    } catch (error) {
      const duration = Date.now() - startTime;
      lastError = error instanceof Error ? error : new Error(String(error));

      logger.warn({
        msg: 'RPC request failed',
        method,
        attempt: attempt + 1,
        maxAttempts,
        duration,
        error: lastError.message,
      });

      if (error instanceof NonRetryableProviderError) {
        throw error;
      }

      const retryable = error instanceof RetryableProviderError || isTransientNetworkError(error);
      if (!retryable) {
        throw error;
      }

      if (attempt < maxAttempts - 1) {
        const delay = calculateDelay(attempt, baseDelayMs, maxDelayMs);
        logger.debug({ msg: 'Retrying after delay', delay, attempt: attempt + 1 });
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new RetryableProviderError(PROVIDER_NAME, 'Request failed after all retries');
}

/** Create an Alchemy JSON-RPC client bound to the given configuration */
export function createAlchemyClient(config: AlchemyConfig): AlchemyClient {
  const logger = createLogger();
  const limiter = pLimit(config.concurrency);

  return {
    jsonRpc: <T>(chain: string, method: string, params: unknown[]): Promise<T> => {
      const chainConfig = config.chains[chain];
      if (!chainConfig) {
        throw new NonRetryableProviderError(PROVIDER_NAME, `No configuration found for chain "${chain}"`);
      }
      return limiter(() => executeJsonRpc<T>(config, logger, chainConfig.rpcUrl, method, params));
    },
  };
}
