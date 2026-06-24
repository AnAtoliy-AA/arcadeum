import type { NextConfig } from 'next';
import path from 'path';
import withPWAInit from '@ducanh2912/next-pwa';
import { withTamagui } from '@tamagui/next-plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';
import packageJson from './package.json';
import {
  LOCALE_SLUGS,
  EN_SLUGS,
  SUPPORTED_LOCALES,
} from './src/shared/config/locale-slugs';

// Build rewrite rules that map localized URLs (`/fr/jeux/...`) to the
// English filesystem directories Next.js actually serves
// (`/fr/games/...`). One pair per (locale, slug) where the localized
// slug differs from the canonical English one.
function buildLocaleRewrites() {
  const rules: Array<{ source: string; destination: string }> = [];
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === 'en') continue;
    const map = LOCALE_SLUGS[locale];
    for (const [key, englishSlug] of Object.entries(EN_SLUGS)) {
      const localizedSlug = map[key as keyof typeof EN_SLUGS];
      if (localizedSlug === englishSlug) continue;
      rules.push({
        source: `/${locale}/${localizedSlug}/:path*`,
        destination: `/${locale}/${englishSlug}/:path*`,
      });
      rules.push({
        source: `/${locale}/${localizedSlug}`,
        destination: `/${locale}/${englishSlug}`,
      });
    }
  }
  return rules;
}

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
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
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
      // Static assets in /public — long-lived immutable cache. These
      // files never change between deploys (Next.js hashes _next/static
      // automatically; the rules below cover /images, /fonts, etc.).
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache-Control on dynamic top-level pages. Expand the
      // `games|chats|history|stats|settings` set across every locale's
      // canonical slug so /fr/jeux, /es/juegos, etc. inherit the same
      // SWR policy as their English equivalents.
      ...(() => {
        const slugKeys = [
          'games',
          'chats',
          'history',
          'stats',
          'settings',
        ] as const;
        const sources = ['/', '/:locale'];
        for (const locale of SUPPORTED_LOCALES) {
          for (const key of slugKeys) {
            const slug = LOCALE_SLUGS[locale][key];
            sources.push(`/${locale}/${slug}/:path*`);
            sources.push(`/${locale}/${slug}`);
          }
        }
        return sources.map((source) => ({
          source,
          headers: [
            {
              key: 'Cache-Control',
              value: isDev
                ? 'no-cache, no-store, must-revalidate'
                : 'public, max-age=0, must-revalidate, stale-while-revalidate=59',
            },
          ],
        }));
      })(),
      // Public info / legal pages change rarely. Let the CDN serve a
      // fresh-ish copy for a few minutes and revalidate in the background
      // for up to a day. Big TTFB win for crawlers + repeat visitors and
      // a direct Core Web Vitals signal.
      ...(() => {
        const slugKeys = [
          'blog',
          'community',
          'developers',
          'help',
          'tournaments',
          'leaderboards',
          'rewards',
          'notes',
          'support',
          'privacy',
          'terms',
          'contact',
          'cookies',
          'players',
        ] as const;
        const sources: string[] = [];
        for (const locale of SUPPORTED_LOCALES) {
          for (const key of slugKeys) {
            const slug = LOCALE_SLUGS[locale]?.[key];
            if (!slug) continue;
            sources.push(`/${locale}/${slug}/:path*`);
            sources.push(`/${locale}/${slug}`);
          }
        }
        return sources.map((source) => ({
          source,
          headers: [
            {
              key: 'Cache-Control',
              value: isDev
                ? 'no-cache, no-store, must-revalidate'
                : 'public, s-maxage=300, stale-while-revalidate=86400',
            },
          ],
        }));
      })(),
    ];
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  // Playwright drives the dev server over 127.0.0.1 while Next.js considers
  // localhost its canonical dev origin, which triggers the dev-mode "Cross
  // origin request detected" warning on every /_next/* request. Allow both
  // loopback hosts so e2e logs stay clean.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  reactCompiler: true,
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
        source: '/:locale/home',
        destination: '/:locale',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      // Run BEFORE Next.js route matching so /fr/jeux is served by the
      // /fr/games filesystem directory.
      beforeFiles: buildLocaleRewrites(),
      afterFiles: [
        {
          source: '/.well-known/security.txt',
          destination: '/security.txt',
        },
      ],
      fallback: [],
    };
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
