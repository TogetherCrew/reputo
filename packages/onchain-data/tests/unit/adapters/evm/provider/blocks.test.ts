import { describe, expect, it } from 'vitest';

import { compareHexBlocks, normalizeHexBlock } from '../../../../../src/adapters/evm/provider/blocks.js';

describe('normalizeHexBlock', () => {
  it('normalizes hex strings by trimming, lowercasing, and removing leading zeroes', () => {
    expect(normalizeHexBlock('  0x000AbC  ')).toBe('0xabc');
  });

  it('normalizes numeric inputs to canonical hex strings', () => {
    expect(normalizeHexBlock(255)).toBe('0xff');
    expect(normalizeHexBlock(0n)).toBe('0x0');
  });

  it('throws for non-hex string input', () => {
    expect(() => normalizeHexBlock('xyz')).toThrow('Invalid hex block value');
  });
});

describe('compareHexBlocks', () => {
  it('treats equivalent block values as equal', () => {
    expect(compareHexBlocks('0x000f', '0xF')).toBe(0);
  });

  it('orders smaller and larger block values correctly', () => {
    expect(compareHexBlocks('0x10', '0x11')).toBe(-1);
    expect(compareHexBlocks('0x11', '0x10')).toBe(1);
  });
});
