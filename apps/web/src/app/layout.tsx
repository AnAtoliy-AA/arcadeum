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
import { TamaguiRegistry } from './TamaguiRegistry';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StyledComponentsRegistry>
          <LanguageProvider>
            <AppThemeProvider>
              <QueryProvider>
                <TamaguiRegistry>
                  <PWAProvider>
                    <Header />
                    {children}
                  </PWAProvider>
                </TamaguiRegistry>
              </QueryProvider>
            </AppThemeProvider>
          </LanguageProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
