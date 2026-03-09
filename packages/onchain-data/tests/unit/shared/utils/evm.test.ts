import { describe, expect, it } from 'vitest';
import { canonicalizeEvmAddress } from '../../../../src/shared/utils/evm.js';

describe('canonicalizeEvmAddress', () => {
  it('should lowercase a mixed-case checksummed address', () => {
    expect(canonicalizeEvmAddress('0xaeA46A60368A7bD060eec7DF8CBa43b7EF41Ad85')).toBe(
      '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85',
    );
  });

  it('should return an already-lowercase address unchanged', () => {
    const lower = '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85';
    expect(canonicalizeEvmAddress(lower)).toBe(lower);
  });

  it('should lowercase an all-uppercase address', () => {
    expect(canonicalizeEvmAddress('0XAEA46A60368A7BD060EEC7DF8CBA43B7EF41AD85')).toBe(
      '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85',
    );
  });

  it('should ensure the same token cannot create duplicate targets', () => {
    const checksummed = '0xaeA46A60368A7bD060eec7DF8CBa43b7EF41Ad85';
    const lower = '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85';
    const upper = '0XAEA46A60368A7BD060EEC7DF8CBA43B7EF41AD85';

    const results = new Set([
      canonicalizeEvmAddress(checksummed),
      canonicalizeEvmAddress(lower),
      canonicalizeEvmAddress(upper),
    ]);

    expect(results.size).toBe(1);
  });
});
