import type { Locale, TranslationBundle } from '../types';

// Static imports for the default locale (English) to ensure it's always available immediately
import { en as authEn } from './auth';
import { en as pagesEn } from './pages';
import { chatMessages, chatListMessages } from './chat';
import { en as commonEn } from './common';
import { en as gamesEn } from './games';
import { en as historyEn } from './history';
import { en as homeEn } from './home';
import { en as legalEn } from './legal';
import { en as navigationEn } from './navigation';
import { en as paymentsEn } from './payments';
import { en as pwaEn } from './pwa';
import { en as settingsEn } from './settings';
import { en as referralsEn } from './referrals';
import { en as seoEn } from './seo';
import { en as statsEn } from './stats';
import { en as supportEn } from './support';
import { en as notificationsEn } from './notifications';

/**
 * Static translations bundle for the default locale.
 * This is used for SSR and as a fallback.
 */
export const translations = {
  en: {
    common: commonEn,
    pages: pagesEn,
    home: homeEn,
    settings: settingsEn,
    support: supportEn,
    auth: authEn,
    navigation: navigationEn,
    chat: chatMessages.en,
    chatList: chatListMessages.en,
    games: gamesEn,
    history: historyEn,
    payments: paymentsEn,
    legal: legalEn,
    stats: statsEn,
    pwa: pwaEn,
    referrals: referralsEn,
    seo: seoEn,
    notifications: notificationsEn,
  },
} as const;

/**
 * Dynamically loads translation bundles for a specific locale.
 * This enables code-splitting, so users only download the messages they need.
 */
export async function loadMessages(locale: Locale): Promise<TranslationBundle> {
  // If English, return the statically bundled version
  if (locale === 'en') {
    return translations.en;
  }

  // Dynamically import all message modules in parallel
  const [
    auth,
    pages,
    chat,
    common,
    games,
    history,
    home,
    legal,
    navigation,
    payments,
    pwa,
    settings,
    referrals,
    seo,
    stats,
    support,
    notifications,
  ] = await Promise.all([
    import('./auth'),
    import('./pages'),
    import('./chat'),
    import('./common'),
    import('./games'),
    import('./history'),
    import('./home'),
    import('./legal'),
    import('./navigation'),
    import('./payments'),
    import('./pwa'),
    import('./settings'),
    import('./referrals'),
    import('./seo'),
    import('./stats'),
    import('./support'),
    import('./notifications'),
  ]);

  // Extract the specific locale from each module
  return {
    common: common[locale],
    pages: pages[locale],
    home: home[locale],
    settings: settings[locale],
    support: support[locale],
    auth: auth[locale],
    navigation: navigation[locale],
    chat: chat.chatMessages[locale],
    chatList: chat.chatListMessages[locale],
    games: games[locale],
    history: history[locale],
    payments: payments[locale],
    legal: legal[locale],
    stats: stats[locale],
    pwa: pwa[locale],
    referrals: referrals[locale],
    seo: seo[locale],
    notifications: notifications[locale],
  };
}
