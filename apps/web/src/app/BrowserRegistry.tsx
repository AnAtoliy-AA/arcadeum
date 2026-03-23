'use client';

import { ReactNode } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { LanguageProvider } from '@/app/i18n/LanguageProvider';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { PWAProvider } from '@/features/pwa';
import { AppThemeProvider } from './theme/ThemeContext';
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
    const code = tamaguiConfig.getCSS();
    return (
      <style
        dangerouslySetInnerHTML={{
          __html: code,
        }}
      />
    );
  });

  return (
    <LanguageProvider initialLocale={initialLocale}>
      <QueryProvider>
        <AppThemeProvider initialTheme={initialTheme}>
          <PWAProvider>{children}</PWAProvider>
        </AppThemeProvider>
      </QueryProvider>
    </LanguageProvider>
  );
}
