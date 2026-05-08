import type { NextConfig } from 'next';
import path from 'path';
import withPWAInit from '@ducanh2912/next-pwa';
import { withTamagui } from '@tamagui/next-plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';
import packageJson from './package.json';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = withPWAInit({
  dest: 'public',
  disable:
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_E2E === 'true',
  register: true,
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    skipWaiting: true,
  },
});

const cspConnectSrc = [
  'https://arcadeum.games',
  'wss://arcadeum.games',
  'https://arcadeum.vercel.app',
  'wss://arcadeum.vercel.app',
  'https://arcadeum-dev.vercel.app',
  'wss://arcadeum-dev.vercel.app',
  'https://arcadeum-be-dev.onrender.com',
  'wss://arcadeum-be-dev.onrender.com',
  'https://arcadeum-be.onrender.com',
  'wss://arcadeum-be.onrender.com',
  'https://arcadeum-be-reserve.onrender.com',
  'wss://arcadeum-be-reserve.onrender.com',
  'https://accounts.google.com',
  'https://vercel.live',
  'wss://*.vercel.live',
  'https://*.vercel.app',
];

const cspScriptSrc = "'unsafe-inline' https://vercel.live https://*.vercel.app";

const cspStyleSrc = "'self' 'unsafe-inline'";

const cspImgSrc = "'self' blob: data: https:";

const cspFontSrc = "'self' data:";

const cspFrameSrc =
  "'self' https://www.youtube-nocookie.com https://vercel.com https://vercel.live";

const nextConfig: NextConfig = {
  headers: async () => {
    const isDev = process.env.NODE_ENV === 'development';
    const isE2E =
      process.env.NEXT_PUBLIC_E2E === 'true' || !!process.env.E2E_PROD;
    const allowLocalhost = isDev || isE2E;

    const connectSrc = [
      "'self'",
      ...(allowLocalhost
        ? [
            'http://localhost:*',
            'ws://localhost:*',
            'http://127.0.0.1:*',
            'ws://127.0.0.1:*',
          ]
        : []),
      ...cspConnectSrc,
    ]
      .filter(Boolean)
      .join(' ');

    const csp = [
      "default-src 'self';",
      `script-src 'self' 'unsafe-eval' ${cspScriptSrc};`,
      `style-src ${cspStyleSrc};`,
      `img-src ${cspImgSrc};`,
      `font-src ${cspFontSrc};`,
      "object-src 'none';",
      "base-uri 'self';",
      "form-action 'self';",
      "frame-ancestors 'self';",
      `frame-src ${cspFrameSrc};`,
      `connect-src ${connectSrc};`,
      ...(allowLocalhost ? [] : ['upgrade-insecure-requests;']),
    ]
      .join(' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return [
      {
        source: '/((?!_next/|_vercel/|favicon.ico|apple-touch-icon).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
      ...[
        '/',
        '/games/:path*',
        '/chats/:path*',
        '/history/:path*',
        '/stats/:path*',
        '/settings/:path*',
      ].map((source) => ({
        source,
        headers: [
          {
            key: 'Cache-Control',
            value: isDev
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=0, must-revalidate, stale-while-revalidate=59',
          },
        ],
      })),
    ];
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  reactCompiler: false,
  compiler: {
    styledComponents: {
      ssr: true,
    },
  },
  transpilePackages: [
    'tamagui',
    '@tamagui/core',
    '@tamagui/web',
    '@tamagui/shorthands',
    '@tamagui/config',
    '@tamagui/lucide-icons',
    '@tamagui/font-inter',
    'react-native-web',
    '@arcadeum/ui',
  ],
  experimental: {
    optimizePackageImports: [
      'tamagui',
      '@tamagui/core',
      '@tamagui/web',
      '@tamagui/shorthands',
      '@tamagui/config',
      '@tamagui/lucide-icons',
      'lucide-react',
      '@arcadeum/ui',
    ],
  },
  turbopack: {
    root: path.resolve(__dirname, '../../'),
    resolveAlias: {
      tamagui: '../../node_modules/tamagui',
      '@tamagui/core': '../../node_modules/@tamagui/core',
      '@tamagui/web': '../../node_modules/@tamagui/web',
    },
  },
  productionBrowserSourceMaps: false,
  trailingSlash: false,
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
  },
};

const tamaguiPlugin = withTamagui({
  config: path.resolve(__dirname, '../../packages/ui/src/tamagui.config.ts'),
  components: ['tamagui', '@arcadeum/ui'],
  appDir: true,
});

export default bundleAnalyzer(tamaguiPlugin(withPWA(nextConfig)));
