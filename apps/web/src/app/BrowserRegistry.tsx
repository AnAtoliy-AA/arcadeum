'use client';

import { ReactNode, useEffect } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { LanguageProvider } from '@/app/i18n/LanguageProvider';
import { PWAProvider } from '@/features/pwa';
import { AppThemeProvider } from './theme/ThemeContext';
import { disconnectSockets } from '@/shared/lib/socket';
import tamaguiConfig, { setupTamagui } from '@/shared/config/tamagui.config';

// Initialize Tamagui on the server as early as possible to stabilize the SSR pass
setupTamagui();

import { useSessionStore } from '@/entities/session/store/sessionStore';

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
      if (!tamaguiConfig) {
        throw new Error('tamaguiConfig is not loaded');
      }
      if (typeof tamaguiConfig.getCSS !== 'function') {
        throw new Error('tamaguiConfig.getCSS is not a function');
      }
      const code = tamaguiConfig.getCSS();
      if (!code) {
        console.warn('Tamagui generated empty CSS during SSR');
        return null;
      }
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

  // Safe hydration sync after the first client-side mount
  useEffect(() => {
    useSessionStore.getState().setHydrated(true);
  }, []);

  return (
    <LanguageProvider initialLocale={initialLocale}>
      <AppThemeProvider initialTheme={initialTheme}>
        <PWAProvider>{children}</PWAProvider>
      </AppThemeProvider>
    </LanguageProvider>
  );
}
