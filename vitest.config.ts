import { extendCoverageExcludes } from './vitest.base'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        projects: [
            'packages/*/vitest.config.ts',
            'apps/*/vitest.config*.ts',
        ],
        reporters: ['default'],
        coverage: {
            provider: 'v8',
            reportsDirectory: './coverage',
            exclude: extendCoverageExcludes([
                'commitlint.config.mjs',
                'scripts/**',
                'vitest.base.ts',
                'vitest.config.ts',
            ]),
        },
    },
})
