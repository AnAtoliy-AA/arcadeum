import type { NextConfig } from 'next';
import path from 'path';
import withPWAInit from '@ducanh2912/next-pwa';
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
  // Disable in local dev and during E2E test builds (E2E_PROD is a
  // server-only flag set by the test:e2e:local script). Never use
  // NEXT_PUBLIC_E2E here — it leaks to the client bundle and
  // inadvertently disables PWA on staging deployments.
  disable:
    process.env.NODE_ENV === 'development' || process.env.E2E_PROD === 'true',
  register: true,
  fallbacks: {
    document: '/offline',
  },
  // ARC-926: compile worker/index.ts (push + notificationclick handlers)
  // into worker-<hash>.js and prepend it to the generated service worker
  // via importScripts. Without this, next-pwa overwrites public/sw.js on
  // prod builds and the push handlers are lost.
  customWorkerSrc: 'worker',
  workboxOptions: {
    skipWaiting: true,
    // ARC-900 offline mode: cache only immutable build assets + static
    // media. Documents/HTML stay network-first via the /offline fallback so
    // stale-bundle issues (see public/sw.js history) cannot resurface.
    runtimeCaching: [
      {
        // ARC-926: document navigations for game play + offline pages.
        // NetworkFirst with a short timeout — never serve stale HTML for
        // these routes, but keep them usable when offline.
        urlPattern:
          /\/(?:games\/[a-z0-9-]+\/play|offline\/[a-z0-9-]+)(?:\?.*)?$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'arcadeum-pages-v1',
          networkTimeoutSeconds: 3,
          expiration: { maxEntries: 60, maxAgeSeconds: 7 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [200] },
        },
      },
      {
        urlPattern: /\/_next\/static\/.+\.(?:js|css|woff2?)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'arcadeum-static-v1',
          expiration: { maxEntries: 300, maxAgeSeconds: 60 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [200] },
        },
      },
      {
        // No `json` here: the regex matches full URLs, so any API response
        // ending in .json would be served stale for up to 30 days.
        urlPattern: /\.(?:png|jpe?g|svg|webp|avif|mp3|wav|ogg)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'arcadeum-media-v1',
          expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [200] },
        },
      },
    ],
  },
});

// Analytics providers (roadmap 6C): only allowlisted when the corresponding
// env vars are set at build time — deployments without analytics keep the
// strict CSP. Plausible loads its script from the API host and beacons events
// to the same host; PostHog uses the API host plus an -assets host for JS.
function analyticsCspOrigins(): string[] {
  const provider =
    process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER?.trim().toLowerCase();
  const origins = new Set<string>();
  if (provider === 'plausible') {
    const host =
      process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST?.trim() ||
      'https://plausible.io';
    origins.add(host);
  }
  if (provider === 'posthog' && process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()) {
    const host = (
      process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com'
    ).replace(/\/$/, '');
    const assetsHost =
      host === 'https://eu.i.posthog.com'
        ? 'https://eu-assets.i.posthog.com'
        : 'https://us-assets.i.posthog.com';
    origins.add(host);
    origins.add(assetsHost);
  }
  return Array.from(origins);
}

const analyticsOrigins = analyticsCspOrigins();

const defaultConnectSrc = [
  'https://arcadeum.games',
  'wss://arcadeum.games',
  'https://api.arcadeum.games',
  'wss://api.arcadeum.games',
  'https://api-dev.arcadeum.games',
  'wss://api-dev.arcadeum.games',
  'https://accounts.google.com',
  'https://vercel.live',
  'wss://*.vercel.live',
  'https://*.vercel.app',
  process.env.NEXT_PUBLIC_CDN_URL || '',
].concat(analyticsOrigins);

const cspConnectSrc = process.env.CSP_CONNECT_SRC
  ? (JSON.parse(process.env.CSP_CONNECT_SRC) as string[])
  : defaultConnectSrc;

// Always include the CDN URL in connect-src so fetch() to tracks.json works,
// even when CSP_CONNECT_SRC override is set.
const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || '';
if (cdnUrl && !cspConnectSrc.includes(cdnUrl)) {
  cspConnectSrc.push(cdnUrl);
}

const cspScriptSrc = [
  "'unsafe-inline'",
  'https://vercel.live',
  'https://*.vercel.app',
  ...analyticsOrigins,
].join(' ');
const cspStyleSrc = "'self' 'unsafe-inline'";
const cspImgSrc = "'self' blob: data: https:";
const cspFontSrc = "'self' data:";
const cspFrameSrc =
  "'self' https://www.youtube-nocookie.com https://vercel.com https://vercel.live";
const cspMediaSrc = `'self' ${process.env.NEXT_PUBLIC_CDN_URL || ''}`;

const isVercel = !!process.env.VERCEL;

const nextConfig: NextConfig = {
  output: isVercel ? undefined : 'standalone',
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
      `script-src 'self'${allowLocalhost ? " 'unsafe-eval'" : ''} ${cspScriptSrc};`,
      `style-src ${cspStyleSrc};`,
      `img-src ${cspImgSrc};`,
      `font-src ${cspFontSrc};`,
      "object-src 'none';",
      `media-src ${cspMediaSrc};`,
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
            key: 'Cache-Control',
            value: isDev
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=0, must-revalidate, stale-while-revalidate=59',
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
            value: 'cross-origin',
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
                : 'public, s-maxage=60, stale-while-revalidate=300',
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
  transpilePackages: ['@arcadeum/ui', '@arcadeum/games-core'],
  experimental: {
    inlineCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@arcadeum/ui',
      'recharts',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      'pixi.js',
      'pixi-filters',
      'qrcode.react',
      'posthog-js',
      'zustand',
    ],
  },
  // Needed so Turbopack accepts the PWA plugin's webpack config in Next 16.
  turbopack: {
    root: path.resolve(__dirname, '../../'),
  },
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
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
    qualities: [40, 55, 70, 75, 80, 85],
    // Smaller `imageSizes` so size-constrained images (hero cards at
    // ~240-280px render width) load at 512w instead of the 640w minimum
    // deviceSizes entry — ~35% fewer bytes for the same look. 64 stays
    // first so fixed-size images (logo) keep their 1x srcset small.
    imageSizes: [64, 128, 256, 384, 512],
    minimumCacheTTL: 3600,
  },
};

export default bundleAnalyzer(withPWA(nextConfig));
