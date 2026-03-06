import { createVitestConfig } from '../../vitest.base'

export default createVitestConfig({
    name: '@reputo/reputation-algorithms',
    include: ['tests/**/*.test.ts'],
    coverageInclude: ['src/**/*.ts'],
    coverageExclude: ['src/registry/index.gen.ts'],
})
