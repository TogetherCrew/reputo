import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['**/*.e2e-spec.ts'],
        globals: true,
        alias: {
            '@src': './src',
            '@test': './test',
        },
        root: './',
        setupFiles: ['./tests/setup.ts'],
        testTimeout: 30000, // 30s for database operations
        hookTimeout: 60000, // 60s for global setup/teardown
    },
    resolve: {
        alias: {
            '@src': './src',
            '@test': './test',
        },
    },
    plugins: [swc.vite()],
})
