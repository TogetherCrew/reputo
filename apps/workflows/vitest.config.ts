import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            exclude: ['**/dist/**', '**/node_modules/**'],
        },
    },
    resolve: {
        alias: {
            '@reputo/reputation-algorithms': resolve(
                __dirname,
                '../../packages/reputation-algorithms/src/index.ts'
            ),
        },
    },
})
