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
        },
    },
})
