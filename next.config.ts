import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep development output separate from a stale cache created before the
  // public /@ID rewrite route was introduced.
  distDir: ".next-runtime",
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};

export default nextConfig;
