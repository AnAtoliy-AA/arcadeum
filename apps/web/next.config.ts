import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: {
      ssr: true,
      displayName: true,
    },
  },
  typedRoutes: false,
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
};

export default nextConfig;
