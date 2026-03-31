import { describe, expect, it } from 'vitest';
import { validateJSONContent } from '../../src/json-validation.js';
import type { JsonIoItem } from '../../src/types/index.js';

const jsonConfig: NonNullable<JsonIoItem['json']> = {
  maxBytes: 1024,
  schema: 'sub_id_wallet_address_map',
  allowedChains: ['ethereum', 'cardano'],
};

describe('validateJSONContent', () => {
  it('accepts a valid sub-id wallet-address map', async () => {
    const result = await validateJSONContent(
      JSON.stringify({
        'SubID-1': {
          ethereum: ['0x1234567890abcdef1234567890abcdef12345678'],
          cardano: ['addr1q9exampleexampleexampleexampleexampleexample'],
        },
        'SubID-2': {
          ethereum: ['0x1234567890abcdef1234567890abcdef12345678'],
        },
        'SubID-3': {},
      }),
      jsonConfig,
    );

    expect(result).toEqual({
      valid: true,
      errors: [],
    });
  });

  it('rejects invalid JSON syntax', async () => {
    const result = await validateJSONContent('{"SubID-1":', jsonConfig);

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Failed to parse JSON');
  });

  it('rejects old top-level wallets wrappers', async () => {
    const result = await validateJSONContent(
      JSON.stringify({
        wallets: {
          ethereum: ['0x1234567890abcdef1234567890abcdef12345678', '0x1234567890ABCDEF1234567890abcdef12345678'],
        },
      }),
      jsonConfig,
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'JSON must not contain the top-level key "wallets"; provide sub-id keys at the root',
    );
  });

  it('rejects unsupported chains, invalid addresses, and duplicates within a sub-id chain', async () => {
    const result = await validateJSONContent(
      JSON.stringify({
        'SubID-1': {
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
        '"SubID-1.ethereum" contains a duplicate address: 0x1234567890ABCDEF1234567890abcdef12345678',
        '"SubID-1.cardano[0]" must be a valid Cardano payment address',
      ]),
    );
  });

  it('allows empty coverage and duplicate wallets across different sub-ids', async () => {
    const result = await validateJSONContent(
      JSON.stringify({
        'SubID-1': {
          ethereum: ['0x1234567890abcdef1234567890abcdef12345678'],
        },
        'SubID-2': {
          ethereum: ['0x1234567890abcdef1234567890abcdef12345678'],
          cardano: [],
        },
        'SubID-3': {},
      }),
      jsonConfig,
    );

    expect(result).toEqual({
      valid: true,
      errors: [],
    });
  });
});
