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
import {
  config as tamaguiConfig,
  setupTamagui,
} from '@/shared/config/tamagui.config';

// Prime config immediately for SSR and Client environments

interface BrowserRegistryProps {
  children: ReactNode;
  initialTheme?: ThemeName;
  initialLocale?: Locale;
}

export default function BrowserRegistry({
  children,
  initialTheme,
  initialLocale,
}: BrowserRegistryProps) {
  useServerInsertedHTML(() => {
    try {
      if (!tamaguiConfig) {
        console.warn(
          'tamaguiConfig is missing during useServerInsertedHTML evaluation',
        );
        // Try fallback initialization
        setupTamagui();
        if (!tamaguiConfig) return null;
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
    <AppThemeProvider initialTheme={initialTheme}>
      <LanguageProvider initialLocale={initialLocale}>
        <PWAProvider>{children}</PWAProvider>
      </LanguageProvider>
    </AppThemeProvider>
  );
}
