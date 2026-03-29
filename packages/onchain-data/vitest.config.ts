import { createVitestConfig } from '../../vitest.base';

export default createVitestConfig({
  name: '@reputo/onchain-data',
  include: ['tests/**/*.test.ts'],
  coverageInclude: ['src/**/*.ts'],
  testTimeout: 120_000,
  hookTimeout: 120_000,
});
