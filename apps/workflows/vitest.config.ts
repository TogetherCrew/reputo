import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: ['node_modules/', 'dist/', '**/*.test.ts', '**/*.spec.ts', 'vitest.config.ts'],
    },
  },
  resolve: {
    alias: {
      '@reputo/reputation-algorithms': resolve(__dirname, '../../packages/reputation-algorithms/src/index.ts'),
    },
  },
});
