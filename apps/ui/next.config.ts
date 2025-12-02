import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // Produce a standalone server output for Docker runtime
    output: 'standalone',
    // Transpile workspace packages for Next.js/Turbopack compatibility
    transpilePackages: [
        '@reputo/algorithm-validator',
        '@reputo/reputation-algorithms',
    ],
}

export default nextConfig
