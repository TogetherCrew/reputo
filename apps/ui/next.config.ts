import path from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@reputo/reputation-algorithms",
    "@reputo/algorithm-validator",
  ],
  outputFileTracingRoot: path.join(__dirname, "../../"),
}

export default nextConfig
