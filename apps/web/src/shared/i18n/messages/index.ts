import type { Locale, TranslationBundle } from '../types';

// Type-only import for TranslationKey inference — erased at compile time
import type { en as authEn } from './auth';
import type { en as pagesEn } from './pages';
import type { en as commonEn } from './common';
import type { GamesMessagesBundle } from './games';
import type { en as historyEn } from './history';
import type { en as homeEn } from './home';
import type { en as legalEn } from './legal';
import type { en as navigationEn } from './navigation';
import type { en as paymentsEn } from './payments';
import type { en as pwaEn } from './pwa';
import type { en as settingsEn } from './settings';
import type { en as referralsEn } from './referrals';
import type { en as seoEn } from './seo';
import type { en as statsEn } from './stats';
import type { en as supportEn } from './support';
import type { en as notificationsEn } from './notifications';
import type { en as battlePassEn } from './battle-pass';
import type { en as musicPlayerEn } from './music-player';
import type { en as walletEn } from './wallet';
import type { chatMessages, chatListMessages } from './chat';

/** English translation type — used only for type inference, no runtime cost */
export type EnglishTranslations = {
  common: typeof commonEn;
  pages: typeof pagesEn;
  home: typeof homeEn;
  settings: typeof settingsEn;
  support: typeof supportEn;
  auth: typeof authEn;
  navigation: typeof navigationEn;
  chat: (typeof chatMessages)['en'];
  chatList: (typeof chatListMessages)['en'];
  games: GamesMessagesBundle;
  history: typeof historyEn;
  payments: typeof paymentsEn;
  legal: typeof legalEn;
  stats: typeof statsEn;
  pwa: typeof pwaEn;
  referrals: typeof referralsEn;
  seo: typeof seoEn;
  notifications: typeof notificationsEn;
  battlePass: typeof battlePassEn;
  musicPlayer: typeof musicPlayerEn;
  wallet: typeof walletEn;
};

/**
 * Dynamically loads translation bundles for a specific locale.
 * All locales (including English) are code-split to keep the initial bundle small.
 */
export async function loadMessages(locale: Locale): Promise<TranslationBundle> {
  const [
    auth,
    pages,
    chat,
    common,
    history,
    homeMod,
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
    battlePass,
    musicPlayer,
    wallet,
  ] = await Promise.all([
    import('./auth'),
    import('./pages'),
    import('./chat'),
    import('./common'),
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
    import('./battle-pass'),
    import('./music-player'),
    import('./wallet'),
  ]);

  const [gamesModule, homeData] = await Promise.all([
    import('./games').then(async (m) => ({
      data: await m.loadGames(locale),
    })),
    homeMod.loadHomeMessages(locale),
  ]);

  return {
    common: common[locale],
    pages: pages[locale],
    home: homeData,
    settings: settings[locale],
    support: support[locale],
    auth: auth[locale],
    navigation: navigation[locale],
    chat: chat.chatMessages[locale],
    chatList: chat.chatListMessages[locale],
    games: gamesModule.data as GamesMessagesBundle,
    history: history[locale],
    payments: payments[locale],
    legal: legal[locale],
    stats: stats[locale],
    pwa: pwa[locale],
    referrals: referrals[locale],
    seo: seo[locale],
    notifications: notifications[locale],
    battlePass: battlePass[locale],
    musicPlayer: musicPlayer[locale],
    wallet: wallet[locale],
  };
}
