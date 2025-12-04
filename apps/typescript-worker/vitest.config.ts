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
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.d.ts', 'src/worker/main.ts', 'scripts/**'],
        },
    },
    resolve: {
        alias: {
            src: resolve(__dirname, './src'),
            '@reputo/storage': resolve(
                __dirname,
                '../../packages/storage/src/index.ts'
            ),
            '@reputo/algorithm-validator': resolve(
                __dirname,
                '../../packages/algorithm-validator/src/index.ts'
            ),
        },
    },
})
