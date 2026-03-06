import { resolve } from 'path'
import { createVitestConfig } from '../../vitest.base'

export default createVitestConfig({
    name: '@reputo/workflows',
    include: ['tests/**/*.test.ts'],
    coverageInclude: ['src/**/*.ts'],
    coverageExclude: [
        'src/workers/typescript/*.worker.ts',
        'src/shared/types/**/*.ts',
    ],
    resolve: {
        alias: {
            '@reputo/reputation-algorithms': resolve(
                __dirname,
                '../../packages/reputation-algorithms/src/index.ts'
            ),
        },
    },
})
