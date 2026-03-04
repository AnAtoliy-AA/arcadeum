import type { NextConfig } from 'next';
import path from 'path';
import withPWAInit from '@ducanh2912/next-pwa';
import packageJson from './package.json';

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
];

const cspScriptSrc = "'unsafe-inline'";

const cspStyleSrc = "'self' 'unsafe-inline'";

const cspImgSrc = "'self' blob: data: https:";

const cspFontSrc = "'self' data:";

const cspFrameSrc = "'self' https://www.youtube-nocookie.com";

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
      "frame-ancestors 'none';",
      `frame-src ${cspFrameSrc};`,
      `connect-src ${connectSrc};`,
      ...(allowLocalhost ? [] : ['upgrade-insecure-requests;']),
    ]
      .join(' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return [
      {
        source: '/(.*)',
        headers: [
          ...(isE2E
            ? []
            : [
                {
                  key: 'Content-Security-Policy',
                  value: csp,
                },
              ]),
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
            value: 'DENY',
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
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
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
            value: 'private, no-cache, no-transform',
          },
        ],
      })),
    ];
  },
  reactCompiler: true,
  compiler: {
    styledComponents: {
      ssr: true,
      displayName: true,
    },
  },
  typedRoutes: false,
  turbopack: {
    root: path.resolve(process.cwd(), '../..'),
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  productionBrowserSourceMaps: true,
  experimental: {
    optimizePackageImports: [
      '@arcadeum/shared-ui',
      'lucide-react',
      'framer-motion',
    ],
  },
};

export default withPWA(nextConfig);
