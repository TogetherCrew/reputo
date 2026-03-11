import { describe, expect, it } from 'vitest';
import { normalizeAlchemyEthereumTransfer } from '../../../src/services/sync-token-transfers-service.js';
import { SupportedTokenChain } from '../../../src/shared/index.js';
import { createMockAlchemyTransfer } from '../../utils/mock-helpers.js';

describe('normalizeAlchemyEthereumTransfer', () => {
  it('normalizes a standard transfer', () => {
    const transfer = createMockAlchemyTransfer({
      blockNum: '0x100',
      uniqueId: '0xdeadbeef:log:0x3',
      hash: '0xdeadbeef',
      from: '0xAAAA000000000000000000000000000000000001',
      to: '0xBBBB000000000000000000000000000000000002',
      value: 42.5,
      metadata: { blockTimestamp: '2024-01-15T10:30:00.000Z' },
    });

    const result = normalizeAlchemyEthereumTransfer({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      transfer,
    });

    expect(result.id).toBe('fet-ethereum:0xdeadbeef:3');
    expect(result.tokenChain).toBe(SupportedTokenChain.FET_ETHEREUM);
    expect(result.blockNumber).toBe('0x100');
    expect(result.transactionHash).toBe('0xdeadbeef');
    expect(result.logIndex).toBe(3);
    expect(result.fromAddress).toBe('0xaaaa000000000000000000000000000000000001');
    expect(result.toAddress).toBe('0xbbbb000000000000000000000000000000000002');
    expect(result.amount).toBe('42.5');
    expect(result.blockTimestamp).toBe('2024-01-15T10:30:00.000Z');
  });

  it('sets blockTimestamp to null when metadata is missing', () => {
    const transfer = createMockAlchemyTransfer({
      metadata: undefined,
    });
    const result = normalizeAlchemyEthereumTransfer({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      transfer,
    });
    expect(result.blockTimestamp).toBeNull();
  });

  it('handles null to address (mint)', () => {
    const transfer = createMockAlchemyTransfer({ to: null });
    const result = normalizeAlchemyEthereumTransfer({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      transfer,
    });
    expect(result.toAddress).toBeNull();
  });

  it('handles null value as "0"', () => {
    const transfer = createMockAlchemyTransfer({ value: null });
    const result = normalizeAlchemyEthereumTransfer({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      transfer,
    });
    expect(result.amount).toBe('0');
  });

  it('lowercases addresses correctly', () => {
    const transfer = createMockAlchemyTransfer({
      from: '0xABCDEF0000000000000000000000000000000001',
      to: '0xFEDCBA0000000000000000000000000000000002',
    });
    const result = normalizeAlchemyEthereumTransfer({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      transfer,
    });
    expect(result.fromAddress).toBe('0xabcdef0000000000000000000000000000000001');
    expect(result.toAddress).toBe('0xfedcba0000000000000000000000000000000002');
  });

  it('parses logIndex from uniqueId with hex value', () => {
    const transfer = createMockAlchemyTransfer({
      uniqueId: '0xdeadbeef:log:0xa',
    });
    const result = normalizeAlchemyEthereumTransfer({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      transfer,
    });
    expect(result.logIndex).toBe(10);
  });

  it('throws on invalid uniqueId format', () => {
    const transfer = createMockAlchemyTransfer({
      uniqueId: 'invalid-format',
    });
    expect(() =>
      normalizeAlchemyEthereumTransfer({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        transfer,
      }),
    ).toThrow('Cannot parse logIndex from uniqueId');
  });
});
