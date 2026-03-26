import { describe, expect, it } from 'vitest';
import { validateJSONContent } from '../../src/json-validation.js';
import type { JsonIoItem } from '../../src/types/index.js';

const jsonConfig: NonNullable<JsonIoItem['json']> = {
  maxBytes: 1024,
  schema: 'wallet_address_map',
  rootKey: 'wallets',
  allowedChains: ['ethereum', 'cardano'],
};

describe('validateJSONContent', () => {
  it('accepts a valid wallet-address map', async () => {
    const result = await validateJSONContent(
      JSON.stringify({
        wallets: {
          ethereum: ['0x1234567890abcdef1234567890abcdef12345678'],
          cardano: ['addr1q9exampleexampleexampleexampleexampleexample'],
        },
      }),
      jsonConfig,
    );

    expect(result).toEqual({
      valid: true,
      errors: [],
    });
  });

  it('rejects invalid JSON syntax', async () => {
    const result = await validateJSONContent('{"wallets":', jsonConfig);

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Failed to parse JSON');
  });

  it('rejects unsupported chains, invalid addresses, duplicates, and empty wallet files', async () => {
    const result = await validateJSONContent(
      JSON.stringify({
        wallets: {
          ethereum: ['0x1234567890abcdef1234567890abcdef12345678', '0x1234567890ABCDEF1234567890abcdef12345678'],
          cardano: ['ADDR1INVALID'],
          cosmos: ['cosmos1invalid'],
        },
      }),
      jsonConfig,
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Unsupported wallet chain key(s): cosmos. Allowed chains: ethereum, cardano',
        '"wallets.ethereum" contains a duplicate address: 0x1234567890ABCDEF1234567890abcdef12345678',
        '"wallets.cardano[0]" must be a valid Cardano payment address',
      ]),
    );
  });

  it('rejects empty wallet arrays across all chains', async () => {
    const result = await validateJSONContent(
      JSON.stringify({
        wallets: {
          ethereum: [],
          cardano: [],
        },
      }),
      jsonConfig,
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Wallet JSON must contain at least one wallet address');
  });
});
