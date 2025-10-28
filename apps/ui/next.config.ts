import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a standalone server output for Docker runtime
  output: "standalone",
};

export default nextConfig;
