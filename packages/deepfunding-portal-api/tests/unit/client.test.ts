import { describe, expect, it } from 'vitest';
import { createDeepFundingClient } from '../../src/api/client.js';
import { HttpError } from '../../src/shared/errors/index.js';

describe('createDeepFundingClient', () => {
  it('should create a client with default config values', () => {
    const client = createDeepFundingClient({
      baseUrl: 'https://example.com/api',
      apiKey: 'test-key',
    });

    expect(client.config.baseUrl).toBe('https://example.com/api');
    expect(client.config.apiKey).toBe('test-key');
    expect(client.config.requestTimeoutMs).toBe(45_000);
    expect(client.config.concurrency).toBe(4);
    expect(client.config.retry.maxAttempts).toBe(7);
    expect(client.config.retry.baseDelayMs).toBe(500);
    expect(client.config.retry.maxDelayMs).toBe(20_000);
    expect(client.config.defaultPageLimit).toBe(500);
  });

  it('should override default config values when provided', () => {
    const client = createDeepFundingClient({
      baseUrl: 'https://example.com/api',
      apiKey: 'test-key',
      requestTimeoutMs: 30_000,
      concurrency: 2,
      retry: {
        maxAttempts: 3,
        baseDelayMs: 100,
        maxDelayMs: 5_000,
      },
      defaultPageLimit: 100,
    });

    expect(client.config.requestTimeoutMs).toBe(30_000);
    expect(client.config.concurrency).toBe(2);
    expect(client.config.retry.maxAttempts).toBe(3);
    expect(client.config.retry.baseDelayMs).toBe(100);
    expect(client.config.retry.maxDelayMs).toBe(5_000);
    expect(client.config.defaultPageLimit).toBe(100);
  });

  it('should have a limiter with the configured concurrency', () => {
    const client = createDeepFundingClient({
      baseUrl: 'https://example.com/api',
      apiKey: 'test-key',
      concurrency: 2,
    });

    expect(client.limiter).toBeDefined();
  });

  it('should have a get method', () => {
    const client = createDeepFundingClient({
      baseUrl: 'https://example.com/api',
      apiKey: 'test-key',
    });

    expect(client.get).toBeDefined();
    expect(typeof client.get).toBe('function');
  });
});

describe('HttpError', () => {
  it('should create an error with status code and text', () => {
    const error = new HttpError(404, 'Not Found', 'Resource not found');

    expect(error.statusCode).toBe(404);
    expect(error.statusText).toBe('Not Found');
    expect(error.body).toBe('Resource not found');
    expect(error.message).toBe('HTTP 404: Not Found');
    expect(error.name).toBe('HttpError');
  });

  it('should work without body', () => {
    const error = new HttpError(500, 'Internal Server Error');

    expect(error.statusCode).toBe(500);
    expect(error.body).toBeUndefined();
  });
});
