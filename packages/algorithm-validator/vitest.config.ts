import { createVitestConfig } from '../../vitest.base'

export default createVitestConfig({
    name: '@reputo/algorithm-validator',
    include: ['tests/**/*.test.ts'],
    coverageInclude: ['src/**/*.ts'],
    coverageExclude: ['src/schemas/index.ts', 'src/types/**/*.ts'],
})
