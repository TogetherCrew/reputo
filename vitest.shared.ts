import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      exclude: ['**/dist/**', '**/node_modules/**'],
    },
  },
});
