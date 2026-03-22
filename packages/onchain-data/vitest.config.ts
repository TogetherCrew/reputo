import { createVitestConfig } from '../../vitest.base';

export default createVitestConfig({
  name: '@reputo/onchain-data',
  include: ['tests/**/*.test.ts'],
  coverageInclude: ['src/**/*.ts'],
  coverageExclude: ['src/shared/types/**/*.ts'],
  testTimeout: 120_000,
  hookTimeout: 120_000,
});
