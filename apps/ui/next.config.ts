import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import type { NextConfig } from "next"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const workspaceRoot = findWorkspaceRoot(__dirname)

function findWorkspaceRoot(fromDir: string): string {
  let current = fromDir
  while (current !== dirname(current)) {
    if (existsSync(join(current, "pnpm-workspace.yaml"))) {
      return current
    }
    current = dirname(current)
  }

  return fromDir
}

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@reputo/algorithm-validator",
    "@reputo/reputation-algorithms",
  ],
  turbopack: {
    root: workspaceRoot,
  },
}

export default nextConfig
