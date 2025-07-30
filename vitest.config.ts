import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        reporters: ['default'],
        coverage: {
            provider: 'v8',
            all: true,
            reportsDirectory: './coverage',
        },
        watch: false,
        projects: ['packages/*', 'apps/*'],
    },
})
