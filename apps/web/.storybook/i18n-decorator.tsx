'use client';

import type { Decorator } from '@storybook/react';
import { LanguageContext } from '@/shared/i18n/LanguageContext';
import { en as sharedGamesEn } from '@/shared/i18n/messages/games/shared';

/**
 * Provides a minimal LanguageContext so components using `useTranslation`
 * render real English strings in Storybook. The shared games bundle exposes
 * the `games.*` namespace that all shared game components read from.
 */
export const withTranslations: Decorator = (Story) => (
  <LanguageContext.Provider
    value={{
      locale: 'en',
      setLocale: () => {},
      messages: { games: sharedGamesEn } as never,
      isReady: true,
    }}
  >
    <Story />
  </LanguageContext.Provider>
);
