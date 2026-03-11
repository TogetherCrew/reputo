import { afterEach, describe, expect, it } from 'vitest';
import type { AlgorithmDefinition } from '../../src/types/index.js';
import { buildZodSchema, validatePayload } from '../../src/validation.js';

const definition: AlgorithmDefinition = {
  key: 'engagement_score',
  name: 'Engagement Score',
  category: 'Engagement',
  description: 'Scores user engagement from uploaded data.',
  version: '1.0.0',
  inputs: [
    {
      key: 'votes_csv',
      label: 'Votes CSV',
      type: 'csv',
      csv: {
        columns: [{ key: 'user_id', type: 'string', required: true }],
      },
    },
    {
      key: 'threshold',
      label: 'Threshold',
      type: 'number',
      min: 0,
      max: 10,
    },
    {
      key: 'min_votes',
      label: 'Minimum Votes',
      type: 'integer',
      min: 1,
    },
    {
      key: 'name',
      label: 'Display Name',
      type: 'string',
      minLength: 3,
    },
    {
      key: 'include_inactive',
      label: 'Include Inactive',
      type: 'boolean',
      required: false,
    },
  ],
  outputs: [],
  runtime: 'typescript',
};

describe('validation', () => {
  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it('coerces numeric strings, trims text, and accepts storage keys on the server', () => {
    const result = validatePayload(definition, {
      votes_csv: 'uploads/votes.csv',
      threshold: '2.5',
      min_votes: '3',
      name: '  Alice  ',
    });

    expect(result).toEqual({
      success: true,
      data: {
        votes_csv: 'uploads/votes.csv',
        threshold: 2.5,
        min_votes: 3,
        name: 'Alice',
      },
    });
  });

  it('returns field-level validation errors for missing and invalid values', () => {
    const result = validatePayload(definition, {
      votes_csv: '',
      threshold: '11',
      min_votes: '2.5',
      name: '  ',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'votes_csv', message: 'Votes CSV is required' }),
        expect.objectContaining({ field: 'threshold', message: 'Threshold must be at most 10' }),
        expect.objectContaining({ field: 'min_votes', message: 'Minimum Votes must be a whole number' }),
        expect.objectContaining({ field: 'name', message: 'Display Name is required' }),
      ]),
    );
  });

  it('accepts either a File or a storage key for csv inputs in the browser', () => {
    (globalThis as { window?: unknown }).window = {};
    const schema = buildZodSchema(definition);
    const file = new File(['user_id\n1'], 'votes.csv', { type: 'text/csv' });

    const fileResult = schema.safeParse({
      votes_csv: file,
      threshold: 1,
      min_votes: 1,
      name: 'Alice',
    });
    const keyResult = schema.safeParse({
      votes_csv: 'uploads/votes.csv',
      threshold: 1,
      min_votes: 1,
      name: 'Alice',
    });

    expect(fileResult.success).toBe(true);
    expect(keyResult.success).toBe(true);
  });

  it('returns a schema-level error when the definition shape is invalid', () => {
    const result = validatePayload(
      {
        ...definition,
        inputs: null,
      } as unknown as AlgorithmDefinition,
      {},
    );

    expect(result).toEqual({
      success: false,
      errors: [
        {
          field: '_schema',
          message: expect.stringContaining('Validation error:'),
        },
      ],
    });
  });

  it('builds correct zod schema when array input uses itemProperties (FormSchema format)', () => {
    const formSchema = {
      ...definition,
      inputs: [
        {
          key: 'token_configs',
          label: 'Tokens to Include',
          type: 'array',
          minItems: 1,
          required: true,
          // FormSchema uses itemProperties instead of item.properties
          itemProperties: [
            {
              key: 'chain_id',
              label: 'Chain',
              type: 'select',
              required: true,
              enum: ['1'],
            },
            {
              key: 'contract_address',
              label: 'Token',
              type: 'select',
              required: true,
              enum: ['0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85'],
            },
          ],
        },
      ],
    } as unknown as AlgorithmDefinition;

    const valid = validatePayload(formSchema, {
      token_configs: [{ chain_id: '1', contract_address: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85' }],
    });
    expect(valid.success).toBe(true);

    const invalid = validatePayload(formSchema, {
      token_configs: [{}],
    });
    expect(invalid.success).toBe(false);
    expect(invalid.errors?.some((e) => e.field.includes('chain_id'))).toBe(true);
  });

  it('rejects duplicate chain_id + contract_address in array inputs', () => {
    const defWithTokenConfigs: AlgorithmDefinition = {
      ...definition,
      inputs: [
        {
          key: 'token_configs',
          label: 'Tokens to Include',
          type: 'array',
          minItems: 1,
          required: true,
          item: {
            type: 'object',
            properties: [
              { key: 'chain_id', label: 'Chain', type: 'string', required: true },
              { key: 'contract_address', label: 'Token', type: 'string', required: true },
            ],
          },
        },
      ],
    };

    const valid = validatePayload(defWithTokenConfigs, {
      token_configs: [
        { chain_id: '1', contract_address: '0xaaa' },
        { chain_id: '1', contract_address: '0xbbb' },
      ],
    });
    expect(valid.success).toBe(true);

    const duplicate = validatePayload(defWithTokenConfigs, {
      token_configs: [
        { chain_id: '1', contract_address: '0xaaa' },
        { chain_id: '1', contract_address: '0xaaa' },
      ],
    });
    expect(duplicate.success).toBe(false);
    expect(duplicate.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'token_configs',
          message: 'Tokens to Include must not contain duplicate chain + token pairs',
        }),
      ]),
    );
  });
});
