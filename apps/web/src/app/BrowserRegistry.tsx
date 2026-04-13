'use client';

import { ReactNode, useEffect } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { LanguageProvider } from '@/app/i18n/LanguageProvider';
import { PWAProvider } from '@/features/pwa';
import { AppThemeProvider } from './theme/ThemeContext';
import { disconnectSockets } from '@/shared/lib/socket';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import { ThemeName } from '@/shared/config/theme';
import { Locale } from '@/shared/i18n';
import tamaguiConfig, { setupTamagui } from '@/shared/config/tamagui.config';

// Prime config immediately for SSR and Client environments
setupTamagui();

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
    const handlePageHide = () => {
      disconnectSockets();
    };

    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

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
