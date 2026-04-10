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
};

export const viewport: Viewport = {
  themeColor: '#151718',
};

import { BrowserRegistry } from './BrowserRegistry';
import { ThemeName, ThemePreference } from '@/shared/config/theme';
import { Locale } from '@/shared/i18n';

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: appConfig.appName,
    url: appConfig.siteUrl,
    logo: `${appConfig.siteUrl}/logo.png`,
    sameAs: Object.values(appConfig.social).filter(Boolean),
  };

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
        <BrowserRegistry initialTheme={theme} initialLocale={locale}>
          <Header />
          {children}
        </BrowserRegistry>
      </body>
    </html>
  );
}
