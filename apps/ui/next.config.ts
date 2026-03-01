import path from "node:path"
import type { NextConfig } from "next"

/** Only used in local dev (pnpm dev): proxy /api to the API server. Leave unset in Docker; Traefik routes /api. */
const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, "")

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),

  transpilePackages: [
    "@reputo/algorithm-validator",
    "@reputo/reputation-algorithms",
  ],

  async rewrites() {
    if (!apiProxyTarget) return []
    return [
      { source: "/api/:path*", destination: `${apiProxyTarget}/api/:path*` },
    ]
  },
}

export default nextConfig
