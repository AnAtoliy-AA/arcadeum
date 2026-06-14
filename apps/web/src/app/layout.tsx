import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';

import './globals.scss';

import { cookies } from 'next/headers';
import { appConfig } from '@/shared/config/app-config';
import { JsonLd } from '@/shared/ui/JsonLd';
import { WebVitalsReporter } from '@/shared/seo/WebVitalsReporter';

import BrowserRegistry from './BrowserRegistry';
import { setupTamagui } from '@/shared/config/tamagui.config';
import { ThemeName, ThemePreference } from '@/shared/config/theme';
import { DEFAULT_LOCALE, isLocale } from '@/shared/i18n';
import { AppThemeProvider } from '@/app/theme/ThemeContext';

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
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    apple: '/icon-192x192.png',
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
};

// Prime Tamagui config as early as possible on the server
setupTamagui();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontClassName = `${geistSans.variable} ${geistSans.className}`;
  const cookieStore = await cookies();
  const theme = (cookieStore.get('app-theme')?.value as ThemeName) || 'dark';
  const themePreference =
    (cookieStore.get('app-theme-preference')?.value as ThemePreference) ||
    'dark';
  const cookieLocale = cookieStore.get('app-language')?.value;
  const htmlLang = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  // Organization is locale-agnostic — same legal entity across languages.
  // WebSite and SoftwareApplication schemas live in [locale]/layout where
  // they can carry `inLanguage` + localized description.
  const contactEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'arcadeum.care@gmail.com';
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
      className={`t_${theme}`}
      data-theme={theme}
      data-theme-preference={themePreference}
    >
      <head>
        {/*
         * Resource hints. Preconnect opens the TCP+TLS handshake before any
         * real request, so when the user (or a crawler running JS) hits the
         * presentation video, OAuth flow, or YouTube thumbnail, the
         * connection is already warm. `dns-prefetch` is the safe fallback
         * for browsers that ignore `preconnect` (older Safari, some bots).
         */}
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        <link rel="dns-prefetch" href="https://www.youtube-nocookie.com" />
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
        <JsonLd data={jsonLd} />
      </head>
      <body className={fontClassName}>
        <WebVitalsReporter />
        <AppThemeProvider initialTheme={theme}>
          <BrowserRegistry>{children}</BrowserRegistry>
        </AppThemeProvider>
      </body>
    </html>
  );
}
