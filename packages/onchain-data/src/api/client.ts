import type pLimit from 'p-limit';
import { createLogger } from '../shared/logging/index.js';
import type { OnchainDataApiConfig, OnchainDataApiConfigInput } from '../shared/types/api-config.js';
import { DEFAULT_CONFIG } from '../shared/types/api-config.js';
import { createLimiter, executeRequest } from './http.js';

/**
 * Onchain data API client
 */
export type OnchainDataClient = {
  config: OnchainDataApiConfig;
  limiter: ReturnType<typeof pLimit>;
  get: <T>(path: string, params?: Record<string, string | number>) => Promise<T>;
};

/**
 * Create an onchain data API client
 */
export function createOnchainDataClient(input: OnchainDataApiConfigInput): OnchainDataClient {
  const config: OnchainDataApiConfig = {
    baseUrl: input.baseUrl,
    apiKey: input.apiKey,
    requestTimeoutMs: input.requestTimeoutMs ?? DEFAULT_CONFIG.requestTimeoutMs,
    concurrency: input.concurrency ?? DEFAULT_CONFIG.concurrency,
    retry: {
      maxAttempts: input.retry?.maxAttempts ?? DEFAULT_CONFIG.retry.maxAttempts,
      baseDelayMs: input.retry?.baseDelayMs ?? DEFAULT_CONFIG.retry.baseDelayMs,
      maxDelayMs: input.retry?.maxDelayMs ?? DEFAULT_CONFIG.retry.maxDelayMs,
    },
    defaultPageLimit: input.defaultPageLimit ?? DEFAULT_CONFIG.defaultPageLimit,
  };

  const logger = createLogger();
  const limiter = createLimiter(config);

  return {
    config,
    limiter,
    get: <T>(path: string, params?: Record<string, string | number>) => {
      return limiter(() => executeRequest<T>(config, logger, path, params));
    },
  };
}
