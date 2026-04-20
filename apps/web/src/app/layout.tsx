import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';

import { cookies } from 'next/headers';
import { appConfig } from '@/shared/config/app-config';
import { Header } from '@/widgets/header';

import { JsonLd } from '@/shared/ui/JsonLd';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.siteUrl),
  title: {
    default: appConfig.seoTitle,
    template: `%s | ${appConfig.appName}`,
  },
  description: appConfig.seoDescription,
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/icon-192x192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
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
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: appConfig.seoTitle,
    description: appConfig.seoDescription,
    images: ['/logo.png'],
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
};

export const viewport: Viewport = {
  themeColor: '#151718',
};

import BrowserRegistry from './BrowserRegistry';
import { setupTamagui } from '@/shared/config/tamagui.config';
import { ThemeName, ThemePreference } from '@/shared/config/theme';
import { Locale } from '@/shared/i18n';

// Provider Imports (Hoisted)
import { LanguageProvider } from '@/app/i18n/LanguageProvider';
import { PWAProvider } from '@/features/pwa';
import { AppThemeProvider } from './theme/ThemeContext';

// Prime Tamagui config as early as possible on the server
setupTamagui();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontClassName = `${geistSans.variable} ${geistMono.variable}`;
  const cookieStore = await cookies();
  const theme = (cookieStore.get('app-theme')?.value as ThemeName) || 'dark';
  const themePreference =
    (cookieStore.get('app-theme-preference')?.value as ThemePreference) ||
    'dark';
  const locale = (cookieStore.get('app-language')?.value as Locale) || 'en';

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: appConfig.appName,
      url: appConfig.siteUrl,
      logo: `${appConfig.siteUrl}/logo.png`,
      sameAs: Object.values(appConfig.social).filter(Boolean),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: appConfig.appName,
      url: appConfig.siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${appConfig.siteUrl}/games?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: appConfig.appName,
      operatingSystem: 'Any',
      applicationCategory: 'GameApplication',
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
      lang={locale}
      className={`t_${theme}`}
      data-theme={theme}
      data-theme-preference={themePreference}
    >
      <head>
        <JsonLd data={jsonLd} />
      </head>
      <body className={fontClassName}>
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
