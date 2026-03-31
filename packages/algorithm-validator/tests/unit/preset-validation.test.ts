import { describe, expect, it } from 'vitest';
import { validateAlgorithmPreset } from '../../src/preset-validation.js';
import type { AlgorithmDefinition } from '../../src/types/index.js';

const definition: AlgorithmDefinition = {
  key: 'token_value_over_time',
  name: 'Token Value Over Time',
  category: 'Activity',
  summary: 'Tracks token holdings over time.',
  description: 'Measures long-held token value.',
  version: '1.0.0',
  inputs: [
    {
      key: 'wallets',
      label: 'Sub-ID Wallet Map JSON',
      type: 'json',
      required: true,
      json: {
        maxBytes: 5242880,
        schema: 'sub_id_wallet_address_map',
        allowedChains: ['ethereum', 'cardano'],
      },
    },
    {
      key: 'selected_resources',
      label: 'Resources to Include',
      type: 'array',
      minItems: 1,
      required: true,
      uniqueBy: ['chain', 'resource_key'],
      uiHint: {
        widget: 'resource_selector',
        resourceCatalog: {
          chains: [
            {
              key: 'ethereum',
              label: 'Ethereum',
              resources: [
                {
                  key: 'fet_token',
                  label: 'FET',
                  kind: 'token',
                  identifier: '0xaaa',
                  tokenIdentifier: '0xaaa',
                  tokenKey: 'fet',
                },
                {
                  key: 'fet_staking_1',
                  label: 'FET Staking',
                  kind: 'contract',
                  identifier: '0xbbb',
                  tokenIdentifier: '0xaaa',
                  tokenKey: 'fet',
                  parentResourceKey: 'fet_token',
                },
              ],
            },
            {
              key: 'cardano',
              label: 'Cardano',
              resources: [
                {
                  key: 'fet_token',
                  label: 'FET',
                  kind: 'token',
                  identifier: 'assetcardano',
                  tokenIdentifier: 'assetcardano',
                  tokenKey: 'fet',
                },
              ],
            },
          ],
        },
      },
      item: {
        type: 'object',
        properties: [
          {
            key: 'chain',
            label: 'Chain',
            type: 'string',
            required: true,
            enum: ['ethereum', 'cardano'],
          },
          {
            key: 'resource_key',
            label: 'Resource',
            type: 'string',
            required: true,
            enum: ['fet_token', 'fet_staking_1'],
          },
        ],
      },
    },
  ],
  outputs: [
    {
      key: 'token_value_over_time',
      label: 'Token Value Over Time',
      type: 'csv',
      csv: {
        columns: [
          {
            key: 'sub_id',
            type: 'string',
          },
        ],
      },
    },
  ],
  runtime: 'typescript',
};

describe('validateAlgorithmPreset', () => {
  it('validates supported grouped resources and file-backed rules through the shared validator', async () => {
    const result = await validateAlgorithmPreset({
      definition,
      preset: {
        key: 'token_value_over_time',
        version: '1.0.0',
        inputs: [
          {
            key: 'wallets',
            value: 'uploads/wallets.json',
          },
          {
            key: 'selected_resources',
            value: [
              {
                chain: 'ethereum',
                resource_key: 'fet_staking_1',
              },
            ],
          },
        ],
      },
      resolveInputContent: async ({ input, value }) => {
        if (input.key === 'wallets' && typeof value === 'string') {
          return JSON.stringify({
            'SubID-1': {
              ethereum: ['0x1234567890abcdef1234567890abcdef12345678'],
            },
          });
        }

        return value;
      },
    });

    expect(result.success).toBe(true);
  });

  it('allows selected chains with no uploaded wallets', async () => {
    const result = await validateAlgorithmPreset({
      definition,
      preset: {
        key: 'token_value_over_time',
        version: '1.0.0',
        inputs: [
          {
            key: 'wallets',
            value: 'uploads/wallets.json',
          },
          {
            key: 'selected_resources',
            value: [
              {
                chain: 'cardano',
                resource_key: 'fet_token',
              },
            ],
          },
        ],
      },
      resolveInputContent: async ({ input, value }) => {
        if (input.key === 'wallets' && typeof value === 'string') {
          return JSON.stringify({
            'SubID-1': {
              ethereum: ['0x1234567890abcdef1234567890abcdef12345678'],
            },
            'SubID-2': {},
          });
        }

        return value;
      },
    });

    expect(result.success).toBe(true);
  });

  it('rejects unsupported legacy preset inputs with a recreate message', async () => {
    const result = await validateAlgorithmPreset({
      definition,
      preset: {
        key: 'token_value_over_time',
        version: '1.0.0',
        inputs: [
          {
            key: 'selected_targets',
            value: [
              {
                chain: 'ethereum',
                target_identifier: '0xaaa',
              },
            ],
          },
        ],
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'selected_targets',
          source: 'definition',
          message: expect.stringContaining('Recreate the preset'),
        }),
        expect.objectContaining({
          field: 'selected_resources',
          source: 'payload',
        }),
      ]),
    );
  });

  it('rejects old-format wallet files that still use the top-level wallets key', async () => {
    const result = await validateAlgorithmPreset({
      definition,
      preset: {
        key: 'token_value_over_time',
        version: '1.0.0',
        inputs: [
          {
            key: 'wallets',
            value: 'uploads/wallets.json',
          },
          {
            key: 'selected_resources',
            value: [
              {
                chain: 'ethereum',
                resource_key: 'fet_token',
              },
            ],
          },
        ],
      },
      resolveInputContent: async ({ input, value }) => {
        if (input.key === 'wallets' && typeof value === 'string') {
          return JSON.stringify({
            wallets: {
              ethereum: ['0x1234567890abcdef1234567890abcdef12345678'],
            },
          });
        }

        return value;
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'wallets',
          source: 'file',
          message: 'JSON must not contain the top-level key "wallets"; provide sub-id keys at the root',
        }),
      ]),
    );
  });

  it('rejects resource keys that do not belong to the selected chain', async () => {
    const result = await validateAlgorithmPreset({
      definition,
      preset: {
        key: 'token_value_over_time',
        version: '1.0.0',
        inputs: [
          {
            key: 'wallets',
            value: 'uploads/wallets.json',
          },
          {
            key: 'selected_resources',
            value: [
              {
                chain: 'cardano',
                resource_key: 'fet_staking_1',
              },
            ],
          },
        ],
      },
      resolveInputContent: async ({ input, value }) => {
        if (input.key === 'wallets' && typeof value === 'string') {
          return JSON.stringify({
            'SubID-1': {
              cardano: ['addr1q9exampleexampleexampleexampleexampleexample'],
            },
          });
        }

        return value;
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'selected_resources.0.resource_key',
          source: 'payload',
          message: 'Resource must match the selected chain',
        }),
      ]),
    );
  });
});
