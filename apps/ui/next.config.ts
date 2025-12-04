import path from "node:path"
import type { NextConfig } from "next"

const workspaceRoot = path.join(__dirname, "../../")
const workspaceAliases = {
  "@reputo/algorithm-validator": path.join(
    workspaceRoot,
    "packages/algorithm-validator/src"
  ),
  "@reputo/reputation-algorithms": path.join(
    workspaceRoot,
    "packages/reputation-algorithms/src"
  ),
}

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    externalDir: true,
  },
  transpilePackages: Object.keys(workspaceAliases),
  outputFileTracingRoot: workspaceRoot,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      ...workspaceAliases,
    }
    return config
  },
  turbopack: {
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
    resolveAlias: workspaceAliases,
  },
}

export default nextConfig
