import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  typedRoutes: false,
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
};

export default nextConfig;
