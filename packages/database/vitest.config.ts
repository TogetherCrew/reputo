import { resolve } from 'path'
import { createVitestConfig } from '../../vitest.base'

export default createVitestConfig({
    name: '@reputo/database',
    include: ['tests/**/*.test.ts'],
    coverageInclude: ['src/**/*.ts'],
    coverageExclude: ['src/shared/types/**/*.ts'],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
})
