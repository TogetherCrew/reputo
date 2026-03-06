import { createVitestConfig } from '../../vitest.base'

export default createVitestConfig({
    name: '@reputo/storage',
    include: ['tests/**/*.test.ts'],
    coverageInclude: ['src/**/*.ts'],
})
