'use client';

import { ReactNode, useEffect } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { LanguageProvider } from '@/app/i18n/LanguageProvider';
import { PWAProvider } from '@/features/pwa';
import { AppThemeProvider } from './theme/ThemeContext';
import { disconnectSockets } from '@/shared/lib/socket';
import tamaguiConfig from '@/shared/config/tamagui.config';
import { ThemeName } from '@/shared/config/theme';
import { Locale } from '@/shared/i18n';

interface BrowserRegistryProps {
  children: ReactNode;
  initialTheme?: ThemeName;
  initialLocale?: Locale;
}

export function BrowserRegistry({
  children,
  initialTheme,
  initialLocale,
}: BrowserRegistryProps) {
  useServerInsertedHTML(() => {
    try {
      const code = tamaguiConfig.getCSS();
      return (
        <style
          dangerouslySetInnerHTML={{
            __html: code,
          }}
        />
      );
    } catch (error) {
      console.error('Failed to generate Tamagui CSS during SSR:', error);
      return null;
    }
  });

  useEffect(() => {
    /**
     * Disconnecting WebSockets on pagehide is essential for Back/Forward cache (bfcache)
     * restoration. Active connections block the page from being stored in memory.
     */
    const handlePageHide = () => {
      disconnectSockets();
    };

    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  return (
    <LanguageProvider initialLocale={initialLocale}>
      <AppThemeProvider initialTheme={initialTheme}>
        <PWAProvider>{children}</PWAProvider>
      </AppThemeProvider>
    </LanguageProvider>
  );
}
