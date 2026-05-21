import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';

import './globals.css';

import { cookies, headers } from 'next/headers';
import { appConfig } from '@/shared/config/app-config';
import { resolveApiBase } from '@/shared/lib/api-base';
import { Header } from '@/widgets/header/ui/Header';
import { JsonLd } from '@/shared/ui/JsonLd';
import { WebVitalsReporter } from '@/shared/seo/WebVitalsReporter';
import { hreflang, isLocale } from '@/shared/i18n/locale-url';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.siteUrl),
  title: {
    default: appConfig.seoTitle,
    template: `%s | ${appConfig.appName}`,
  },
  description: appConfig.seoDescription,
  applicationName: appConfig.appName,
  generator: 'Next.js',
  referrer: 'strict-origin-when-cross-origin',
  creator: appConfig.appName,
  publisher: appConfig.appName,
  category: 'games',
  classification: 'Online Board Games',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192x192.png', sizes: '192x192' }],
    shortcut: ['/favicon.png'],
  },
  appleWebApp: {
    capable: true,
    title: appConfig.appName,
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['es_ES', 'fr_FR', 'ru_RU', 'be_BY'],
    url: appConfig.siteUrl,
    siteName: appConfig.appName,
    title: appConfig.seoTitle,
    description: appConfig.seoDescription,
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: appConfig.appName,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: appConfig.seoTitle,
    description: appConfig.seoDescription,
    images: ['/logo.png'],
    creator: appConfig.social.x,
    site: appConfig.social.x,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#151718' },
  ],
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

import BrowserRegistry from './BrowserRegistry';
import { setupTamagui } from '@/shared/config/tamagui.config';
import { ThemeName, ThemePreference } from '@/shared/config/theme';
import { Locale } from '@/shared/i18n';

// Provider Imports (Hoisted)
import { LanguageProvider } from '@/app/i18n/LanguageProvider';
import { PWAProvider } from '@/features/pwa/PWAContext';
import { AppThemeProvider } from '@/app/theme/ThemeContext';

// Prime Tamagui config as early as possible on the server
setupTamagui();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontClassName = `${geistSans.variable} ${geistSans.className}`;
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const theme = (cookieStore.get('app-theme')?.value as ThemeName) || 'dark';
  const themePreference =
    (cookieStore.get('app-theme-preference')?.value as ThemePreference) ||
    'dark';
  const urlLocale = requestHeaders.get('x-locale') ?? undefined;
  const cookieLocale = cookieStore.get('app-language')?.value;
  // URL is the source of truth for SEO — the cookie is only a fallback for
  // requests that bypass the middleware (e.g. static generation).
  const locale: Locale = isLocale(urlLocale)
    ? urlLocale
    : isLocale(cookieLocale)
      ? cookieLocale
      : 'en';

  const socialLinks = Object.values(appConfig.social).filter(Boolean);
  const apiOrigin = (() => {
    try {
      return new URL(resolveApiBase()).origin;
    } catch {
      return undefined;
    }
  })();

  const contactEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'arcadeum.care@gmail.com';

  const jsonLd: Record<string, unknown>[] = [
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
        url: appConfig.social.linkedin,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: contactEmail,
        availableLanguage: ['en', 'es', 'fr', 'ru', 'be'],
      },
      sameAs: socialLinks,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${appConfig.siteUrl}/#website`,
      name: appConfig.appName,
      url: appConfig.siteUrl,
      description: appConfig.seoDescription,
      inLanguage: ['en', 'es', 'fr', 'ru', 'be'],
      publisher: { '@id': `${appConfig.siteUrl}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${appConfig.siteUrl}/games?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: appConfig.appName,
      url: appConfig.siteUrl,
      operatingSystem: 'Web, iOS, Android',
      applicationCategory: 'GameApplication',
      applicationSubCategory: 'BoardGame',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1240',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  ];

  return (
    <html
      lang={hreflang(locale)}
      className={`t_${theme}`}
      data-theme={theme}
      data-theme-preference={themePreference}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {apiOrigin ? (
          <>
            <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={apiOrigin} />
          </>
        ) : null}
        <JsonLd data={jsonLd} />
      </head>
      <body className={fontClassName}>
        <WebVitalsReporter />
        <AppThemeProvider initialTheme={theme}>
          <LanguageProvider initialLocale={locale}>
            <PWAProvider>
              <BrowserRegistry>
                <Header />
                {children}
              </BrowserRegistry>
            </PWAProvider>
          </LanguageProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
