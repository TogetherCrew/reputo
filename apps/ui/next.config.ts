import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // Produce a standalone server output for Docker runtime
    output: 'standalone',
    // Transpile workspace packages for Next.js/Turbopack compatibility
    transpilePackages: [
        '@reputo/algorithm-validator',
        '@reputo/reputation-algorithms',
    ],
    // Turbopack aliases to resolve workspace packages from built dist
    // This is needed for pnpm injected workspace packages with Turbopack
    turbopack: {
        resolveAlias: {
            '@reputo/algorithm-validator':
                '../../packages/algorithm-validator/dist/index.js',
            '@reputo/reputation-algorithms':
                '../../packages/reputation-algorithms/dist/index.js',
        },
    },
}

export default nextConfig
