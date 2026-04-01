import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Enable static export for Cloudflare Pages
  output: 'export',
  trailingSlash: true,
};

export default nextConfig;
