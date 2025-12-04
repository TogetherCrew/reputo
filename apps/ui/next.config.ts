import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    output: 'standalone',
    transpilePackages: [
        '@reputo/reputation-algorithms',
        '@reputo/algorithm-validator',
    ],
}

export default nextConfig
