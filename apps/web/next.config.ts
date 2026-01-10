import type { NextConfig } from 'next';

// Extend the NextConfig type to include the experimental turbopack property
// which is missing from the current Next.js type definitions
type NextConfigWithTurbopack = NextConfig & {
  experimental?: {
    turbopack?: {
      root?: string;
    };
  };
};

const nextConfig: NextConfigWithTurbopack = {
  compiler: {
    styledComponents: true,
  },
  typedRoutes: false,
  experimental: {
    turbopack: {
      root: '../..',
    },
  },
};

export default nextConfig;
