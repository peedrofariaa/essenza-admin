import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: false,
  },
  images: {
    minimumCacheTTL: 0,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.essenzame.com.br',
      },
    ],
  },
};

export default nextConfig;
