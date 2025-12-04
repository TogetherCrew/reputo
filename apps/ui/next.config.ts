import path from "node:path"
import type { NextConfig } from "next"

const workspaceRoot = path.join(__dirname, "../../")

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    externalDir: true,
  },
  transpilePackages: ["@reputo/reputation-algorithms"],
  outputFileTracingRoot: workspaceRoot,
}

export default nextConfig
