/**
 * HTTP error with status code
 */
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly statusText: string,
    public readonly body?: string,
  ) {
    super(`HTTP ${statusCode}: ${statusText}`);
    this.name = 'HttpError';
  }
}

/**
 * Base provider error for all blockchain data providers.
 */
export class ProviderError extends Error {
  constructor(
    public readonly provider: string,
    message: string,
  ) {
    super(`[${provider}] ${message}`);
    this.name = 'ProviderError';
  }
}

/**
 * Transient provider failure that should be retried
 * (e.g. rate-limit, timeout, 5xx).
 */
export class RetryableProviderError extends ProviderError {
  constructor(provider: string, message: string) {
    super(provider, message);
    this.name = 'RetryableProviderError';
  }
}

/**
 * Permanent provider failure that should NOT be retried
 * (e.g. invalid params, auth failure, 4xx other than 429).
 */
export class NonRetryableProviderError extends ProviderError {
  constructor(provider: string, message: string) {
    super(provider, message);
    this.name = 'NonRetryableProviderError';
  }
}
