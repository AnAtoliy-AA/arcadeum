import type { Metadata, Viewport } from 'next';

import './globals.scss';
import './fonts.css';

import { cookies } from 'next/headers';
import { appConfig } from '@/shared/config/app-config';
import { JsonLd } from '@/shared/ui/JsonLd';
import { WebVitalsReporter } from '@/shared/seo/WebVitalsReporter';
import { AnalyticsProvider } from '@/shared/analytics/AnalyticsProvider';
import { VercelAnalytics } from './VercelAnalytics';

import BrowserRegistry from './BrowserRegistry';
import {
  DEFAULT_THEME_NAME,
  ThemeName,
  ThemePreference,
} from '@/shared/config/theme';
import { DEFAULT_LOCALE, isLocale } from '@/shared/i18n';
import { AppThemeProvider } from '@/app/theme/ThemeContext';
import { LazySessionRoleSync } from '@/shared/ui/LazySessionRoleSync';

// Self-hosted Geist variable font — the .font-geist-variable class (fonts.css)
// sets the font stack and exposes --font-geist-sans for SCSS consumers.
const FONT_CLASS = 'font-geist-variable';

// NOTE: openGraph.locale is set per-locale in [locale]/layout.tsx
// generateMetadata — no need to duplicate it here.
export const metadata: Metadata = {
  metadataBase: new URL(appConfig.siteUrl),
  title: appConfig.seoTitle,
  description: appConfig.seoDescription,
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    apple: '/icon-192x192.png',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@_arcadeum_',
    title: appConfig.seoTitle,
    description: appConfig.seoDescription,
    images: [
      { url: '/logo.png', width: 1200, height: 630, alt: appConfig.appName },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  keywords: [
    'board games',
    'online board games',
    'play board games online',
    'tabletop games',
    'multiplayer board games',
    'free online board games',
    'online board game platform',
    'arcadeum',
  ],
  verification: {
    google: appConfig.verification.google,
    yandex: appConfig.verification.yandex,
    yahoo: appConfig.verification.yahoo,
    other: appConfig.verification.bing
      ? { 'msvalidate.01': appConfig.verification.bing }
      : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: '#151718',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme =
    (cookieStore.get('app-theme')?.value as ThemeName) || DEFAULT_THEME_NAME;
  const themePreference =
    (cookieStore.get('app-theme-preference')?.value as ThemePreference) ||
    'dark';
  const cookieLocale = cookieStore.get('app-language')?.value;
  const htmlLang = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  // Organization is locale-agnostic — same legal entity across languages.
  // WebSite and SoftwareApplication schemas live in [locale]/layout where
  // they can carry `inLanguage` + localized description.
  const contactEmail = appConfig.supportEmail;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${appConfig.siteUrl}/#organization`,
      name: appConfig.appName,
      url: appConfig.siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${appConfig.siteUrl}/logo.png`,
        width: 1200,
        height: 630,
      },
      image: `${appConfig.siteUrl}/logo.png`,
      description: appConfig.seoDescription,
      foundingDate: '2024',
      founder: {
        '@type': 'Person',
        name: 'Anatoliy Aliaksandrau',
        ...(appConfig.social.linkedin
          ? { url: appConfig.social.linkedin }
          : {}),
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: contactEmail,
        availableLanguage: ['en', 'es', 'fr', 'ru', 'be'],
      },
      sameAs: Object.values(appConfig.social).filter(Boolean),
    },
  ];

  return (
    <html
      lang={htmlLang}
      data-theme={theme}
      data-theme-preference={themePreference}
    >
      <head>
        {/*
         * Resource hints — only for origins actually used on first paint.
         * R2 CDN hosts game cover images and assets loaded eagerly.
         * YouTube preconnects moved to presentation section (loaded on click).
         */}
        <link
          rel="preload"
          href="/fonts/geist-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {process.env.NEXT_PUBLIC_CDN_URL ? (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_CDN_URL} />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_CDN_URL} />
          </>
        ) : null}
        <link
          rel="preconnect"
          href={
            process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.arcadeum.games'
          }
        />
        <link
          rel="dns-prefetch"
          href={
            process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.arcadeum.games'
          }
        />
        <JsonLd data={jsonLd} />
      </head>
      <body className={FONT_CLASS}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <WebVitalsReporter />
        <AnalyticsProvider />
        {process.env.NODE_ENV === 'production' && process.env.VERCEL && (
          <VercelAnalytics />
        )}
        <AppThemeProvider initialTheme={theme}>
          <BrowserRegistry>
            <LazySessionRoleSync />
            {children}
          </BrowserRegistry>
        </AppThemeProvider>
      </body>
    </html>
  );
}
