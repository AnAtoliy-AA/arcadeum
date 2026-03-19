import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';

import { appConfig } from '@/shared/config/app-config';
import { QueryProvider } from './providers/QueryProvider';
import { LanguageProvider } from './i18n/LanguageProvider';
import { StyledComponentsRegistry } from './StyledComponentsRegistry';
import { AppThemeProvider } from './theme/ThemeContext';
import { Header } from '@/widgets/header';
import { PWAProvider } from '@/features/pwa';

import { JsonLd } from '@/shared/ui/JsonLd';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: appConfig.appName,
    url: appConfig.siteUrl,
    logo: `${appConfig.siteUrl}/logo.png`,
    sameAs: Object.values(appConfig.social).filter(Boolean),
  };

  return (
    <html lang="en">
      <head>
        <JsonLd data={jsonLd} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StyledComponentsRegistry>
          <LanguageProvider>
            <AppThemeProvider>
              <QueryProvider>
                <PWAProvider>
                  <Header />
                  {children}
                </PWAProvider>
              </QueryProvider>
            </AppThemeProvider>
          </LanguageProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
