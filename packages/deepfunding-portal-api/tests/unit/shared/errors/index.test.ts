import { describe, expect, it } from 'vitest';
import { HttpError } from '../../../../src/shared/errors/index.js';

describe('HttpError', () => {
  it('should create error with status code and message', () => {
    const error = new HttpError(404, 'Not Found');

    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(404);
    expect(error.statusText).toBe('Not Found');
    expect(error.message).toBe('HTTP 404: Not Found');
    expect(error.name).toBe('HttpError');
  });

  it('should include body when provided', () => {
    const body = '{"error": "Resource not found"}';
    const error = new HttpError(404, 'Not Found', body);

    expect(error.body).toBe(body);
  });

  it('should handle different status codes', () => {
    const statusCodes = [200, 400, 401, 403, 404, 500, 502, 503];

    for (const statusCode of statusCodes) {
      const error = new HttpError(statusCode, 'Test Error');
      expect(error.statusCode).toBe(statusCode);
      expect(error.message).toContain(String(statusCode));
    }
  });

  it('should format error message correctly', () => {
    const error = new HttpError(500, 'Internal Server Error');
    expect(error.message).toBe('HTTP 500: Internal Server Error');
  });

  it('should be throwable', () => {
    const error = new HttpError(400, 'Bad Request');

    expect(() => {
      throw error;
    }).toThrow(HttpError);

    expect(() => {
      throw error;
    }).toThrow('HTTP 400: Bad Request');
  });
});
