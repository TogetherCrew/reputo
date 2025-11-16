import { resolve } from 'path'
import swc from 'unplugin-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'
export default defineConfig({
    test: {
        globals: true,
    },
    plugins: [
        swc.vite({
            module: { type: 'es6' },
        }),
        tsconfigPaths(),
    ],
    resolve: {
        alias: {
            src: resolve(__dirname, './src'),
            '@reputo/database': resolve(
                __dirname,
                '../../packages/database/src/index.ts'
            ),
            '@reputo/reputation-algorithms': resolve(
                __dirname,
                '../../packages/reputation-algorithms/src/index.ts'
            ),
            '@reputo/storage': resolve(
                __dirname,
                '../../packages/storage/src/index.ts'
            ),
        },
    },
})
