import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
    output: 'standalone',
    transpilePackages: [
        '@reputo/reputation-algorithms',
        '@reputo/algorithm-validator',
    ],
    outputFileTracingRoot: path.join(__dirname, '../../'),
}

export default nextConfig
