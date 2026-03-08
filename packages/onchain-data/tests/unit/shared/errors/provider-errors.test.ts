import { describe, expect, it } from 'vitest';
import {
  NonRetryableProviderError,
  ProviderError,
  RetryableProviderError,
} from '../../../../src/shared/errors/index.js';

describe('Provider Errors', () => {
  describe('ProviderError', () => {
    it('should include provider name in the message', () => {
      const error = new ProviderError('alchemy', 'something went wrong');

      expect(error.message).toBe('[alchemy] something went wrong');
      expect(error.provider).toBe('alchemy');
      expect(error.name).toBe('ProviderError');
    });

    it('should be an instance of Error', () => {
      const error = new ProviderError('test', 'msg');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('RetryableProviderError', () => {
    it('should extend ProviderError', () => {
      const error = new RetryableProviderError('alchemy', 'rate limited');

      expect(error).toBeInstanceOf(ProviderError);
      expect(error).toBeInstanceOf(RetryableProviderError);
      expect(error.name).toBe('RetryableProviderError');
      expect(error.provider).toBe('alchemy');
    });
  });

  describe('NonRetryableProviderError', () => {
    it('should extend ProviderError', () => {
      const error = new NonRetryableProviderError('alchemy', 'invalid params');

      expect(error).toBeInstanceOf(ProviderError);
      expect(error).toBeInstanceOf(NonRetryableProviderError);
      expect(error.name).toBe('NonRetryableProviderError');
      expect(error.provider).toBe('alchemy');
    });
  });
});
