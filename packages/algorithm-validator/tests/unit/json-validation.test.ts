import { describe, expect, it } from 'vitest';
import { validateJSONContent } from '../../src/json-validation.js';
import type { JsonIoItem } from '../../src/types/index.js';

const jsonConfig: NonNullable<JsonIoItem['json']> = {
  maxBytes: 1024,
  schema: 'sub_id_input_map',
  allowedChains: ['ethereum', 'cardano'],
};

describe('validateJSONContent', () => {
  it('accepts a valid SubID input map', async () => {
    const result = await validateJSONContent(
      JSON.stringify({
        'SubID-1': {
          deepVotingPortalId: 'collection-1',
          deepProposalPortalId: 42,
          userWallets: [
            {
              address: '0x1234567890abcdef1234567890abcdef12345678',
              chain: 'ethereum',
            },
          ],
        },
        'SubID-2': {
          userWallets: [
            {
              address: 'addr1q9exampleexampleexampleexampleexampleexample',
              chain: 'cardano',
            },
          ],
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

  it('rejects legacy top-level wallets wrappers', async () => {
    const result = await validateJSONContent(
      JSON.stringify({
        wallets: {
          ethereum: ['0x1234567890abcdef1234567890abcdef12345678'],
        },
      }),
      jsonConfig,
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Legacy top-level "wallets" JSON is not supported; provide SubID keys at the root');
  });

  it('rejects unsupported keys, invalid wallet objects, and invalid addresses', async () => {
    const result = await validateJSONContent(
      JSON.stringify({
        'SubID-1': {
          extraKey: true,
          userWallets: [
            {
              address: '0xnot-an-address',
              chain: 'ethereum',
              note: 'duplicate metadata is not allowed',
            },
            {
              address: 'addr1q9exampleexampleexampleexampleexampleexample',
              chain: 'cosmos',
            },
          ],
        },
      }),
      jsonConfig,
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        '"SubID-1" contains unsupported key(s): extraKey',
        '"SubID-1.userWallets[0]" contains unsupported key(s): note',
        '"SubID-1.userWallets[0].address" must be a valid Ethereum address',
        '"SubID-1.userWallets[1].chain" must be one of: ethereum, cardano',
      ]),
    );
  });

  it('allows empty optional fields and duplicate wallets across different SubIDs', async () => {
    const result = await validateJSONContent(
      JSON.stringify({
        'SubID-1': {
          deepVotingPortalId: '',
          userWallets: [
            {
              address: '0x1234567890abcdef1234567890abcdef12345678',
              chain: 'ethereum',
            },
          ],
        },
        'SubID-2': {
          deepProposalPortalId: '',
          userWallets: [
            {
              address: '0x1234567890ABCDEF1234567890abcdef12345678',
              chain: 'ethereum',
            },
          ],
        },
        'SubID-3': {
          userWallets: [
            {
              address: '',
              chain: '',
            },
          ],
        },
      }),
      jsonConfig,
    );

    expect(result).toEqual({
      valid: true,
      errors: [],
    });
  });
});
