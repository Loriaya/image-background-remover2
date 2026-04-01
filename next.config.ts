import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Export static files for Cloudflare Pages
  output: 'export',
  // Disable server features that require Node.js
  trailingSlash: true,
};

export default nextConfig;
