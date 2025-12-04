import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@reputo/algorithm-validator",
    "@reputo/reputation-algorithms",
  ],
}

export default nextConfig
