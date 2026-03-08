import { describe, expect, it } from 'vitest';

describe('@reputo/onchain-data', () => {
  it('should be importable', async () => {
    const mod = await import('../../src/index.js');
    expect(mod).toBeDefined();
  });
});
