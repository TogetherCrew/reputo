import { describe, expect, it } from 'vitest';
import { normalizeEvmAddress } from '../../../src/shared/index.js';

describe('normalizeEvmAddress', () => {
  it('lowercases a checksummed address', () => {
    const checksummed = '0xAeA46A60368A7bD060eEC7DF8CBa43b7EF41aD85';
    expect(normalizeEvmAddress(checksummed)).toBe('0xaea46a60368a7bd060eec7df8cba43b7ef41ad85');
  });

  it('returns an already-lowercase address unchanged', () => {
    const lower = '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85';
    expect(normalizeEvmAddress(lower)).toBe(lower);
  });

  it('lowercases an all-uppercase address', () => {
    const upper = '0xAEA46A60368A7BD060EEC7DF8CBA43B7EF41AD85';
    expect(normalizeEvmAddress(upper)).toBe('0xaea46a60368a7bd060eec7df8cba43b7ef41ad85');
  });
});
