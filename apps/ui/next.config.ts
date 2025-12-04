import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import type { NextConfig } from "next"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@reputo/algorithm-validator",
    "@reputo/reputation-algorithms",
  ],
  turbopack: {
    root: resolve(__dirname, "../.."),
  },
}

export default nextConfig
