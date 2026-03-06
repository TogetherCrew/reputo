import type { PluginOption, UserConfig } from 'vite'
import { defineConfig } from 'vitest/config'

const sharedCoverageExcludes = [
  '**/coverage/**',
  '**/dist/**',
  '**/node_modules/**',
  '**/.next/**',
  '**/*.d.ts',
  'src/**/index.ts',
]

export function extendCoverageExcludes(extraExcludes: string[] = []): string[] {
  return [...new Set([...sharedCoverageExcludes, ...extraExcludes])]
}

interface SharedVitestConfigOptions {
  name?: string
  include?: string[]
  coverageInclude?: string[]
  coverageExclude?: string[]
  environment?: 'node' | 'jsdom'
  setupFiles?: string[]
  testTimeout?: number
  hookTimeout?: number
  resolve?: UserConfig['resolve']
  plugins?: PluginOption[]
}

export function createVitestConfig({
  name,
  include = ['tests/**/*.test.ts'],
  coverageInclude = ['src/**/*.ts'],
  coverageExclude = [],
  environment = 'node',
  setupFiles,
  testTimeout,
  hookTimeout,
  resolve,
  plugins,
}: SharedVitestConfigOptions = {}) {
  return defineConfig({
    plugins,
    resolve,
    test: {
      name,
      globals: true,
      environment,
      include,
      setupFiles,
      testTimeout,
      hookTimeout,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        all: true,
        include: coverageInclude,
        exclude: extendCoverageExcludes(coverageExclude),
      },
    },
  })
}
