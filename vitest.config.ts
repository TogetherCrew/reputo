import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        projects: ['packages/*', 'apps/*'],
        reporters: ['default'],
        coverage: {
            provider: 'v8',
            all: true,
            reportsDirectory: './coverage',
        },
        watch: false,
    },
})
