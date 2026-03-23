import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';

import { cookies } from 'next/headers';
import { appConfig } from '@/shared/config/app-config';
import { Header } from '@/widgets/header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: appConfig.seoTitle,
  description: appConfig.seoDescription,
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
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

  return (
    <html
      lang={locale}
      className={`t_${theme}`}
      data-theme={theme}
      data-theme-preference={themePreference}
    >
      <body className={fontClassName}>
        <BrowserRegistry initialTheme={theme} initialLocale={locale}>
          <Header />
          {children}
        </BrowserRegistry>
      </body>
    </html>
  );
}
