import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages compatibility
  images: {
    unoptimized: true,
  },
  // Ensure static export for Cloudflare Pages
  output: 'standalone',
};

export default nextConfig;
