import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        projects: [
            'packages/*/vitest.config.ts',
            'apps/*/vitest.config.ts',
        ],
        reporters: ['default'],
        coverage: {
            provider: 'v8',
            all: true,
            reportsDirectory: './coverage',
            exclude: [
                '**/dist/**',
                '**/node_modules/**',
                '**/.next/**',
            ],
        },
        watch: false,
    },
})
