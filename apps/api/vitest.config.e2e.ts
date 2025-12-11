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
        testTimeout: 30000,
        hookTimeout: 120000,
    },
    resolve: {
        alias: {
            '@src': './src',
            '@test': './test',
        },
    },
    plugins: [swc.vite()],
})
