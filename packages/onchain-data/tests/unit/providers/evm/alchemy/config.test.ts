import { describe, expect, it } from 'vitest';
import {
  ALCHEMY_DEFAULTS,
  CHAIN_IDS,
  ETHEREUM_FET_EXAMPLE,
  resolveAlchemyConfig,
} from '../../../../../src/providers/evm/alchemy/config.js';

describe('Alchemy Config', () => {
  const minimalInput = {
    chains: { ethereum: { rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/key' } },
  };

  describe('resolveAlchemyConfig', () => {
    it('should apply defaults when optional fields are omitted', () => {
      const config = resolveAlchemyConfig(minimalInput);

      expect(config.chains).toBe(minimalInput.chains);
      expect(config.requestTimeoutMs).toBe(ALCHEMY_DEFAULTS.requestTimeoutMs);
      expect(config.concurrency).toBe(ALCHEMY_DEFAULTS.concurrency);
      expect(config.retry).toEqual(ALCHEMY_DEFAULTS.retry);
    });

    it('should allow overriding all optional fields', () => {
      const config = resolveAlchemyConfig({
        ...minimalInput,
        requestTimeoutMs: 5_000,
        concurrency: 10,
        retry: { maxAttempts: 2, baseDelayMs: 100, maxDelayMs: 500 },
      });

      expect(config.requestTimeoutMs).toBe(5_000);
      expect(config.concurrency).toBe(10);
      expect(config.retry).toEqual({ maxAttempts: 2, baseDelayMs: 100, maxDelayMs: 500 });
    });

    it('should allow partial retry overrides', () => {
      const config = resolveAlchemyConfig({
        ...minimalInput,
        retry: { maxAttempts: 3 },
      });

      expect(config.retry.maxAttempts).toBe(3);
      expect(config.retry.baseDelayMs).toBe(ALCHEMY_DEFAULTS.retry.baseDelayMs);
      expect(config.retry.maxDelayMs).toBe(ALCHEMY_DEFAULTS.retry.maxDelayMs);
    });
  });

  describe('CHAIN_IDS', () => {
    it('should map ethereum to chain ID 1', () => {
      expect(CHAIN_IDS.ethereum).toBe('1');
    });

    it('should include polygon, arbitrum, optimism, base', () => {
      expect(CHAIN_IDS.polygon).toBe('137');
      expect(CHAIN_IDS.arbitrum).toBe('42161');
      expect(CHAIN_IDS.optimism).toBe('10');
      expect(CHAIN_IDS.base).toBe('8453');
    });
  });

  describe('ETHEREUM_FET_EXAMPLE', () => {
    it('should reference ethereum chain and the FET contract address', () => {
      expect(ETHEREUM_FET_EXAMPLE.chain).toBe('ethereum');
      expect(ETHEREUM_FET_EXAMPLE.tokenContractAddress).toBe('0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85');
    });
  });
});
