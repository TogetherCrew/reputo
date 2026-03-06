import swc from 'unplugin-swc'
import { createVitestConfig } from '../../vitest.base'

export default createVitestConfig({
    name: '@reputo/api-e2e',
    include: ['tests/**/*.e2e-spec.ts'],
    coverageInclude: ['src/**/*.ts'],
    coverageExclude: [
        'src/main.ts',
        'src/**/*.module.ts',
        'src/**/dto/*.ts',
        'src/config/*.ts',
    ],
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 120000,
    resolve: {
        alias: {
            '@src': './src',
            '@test': './test',
        },
    },
    plugins: [swc.vite()],
})
