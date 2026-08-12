import { cookies } from 'next/headers';
import {
  loadMessages,
  isLocale,
  DEFAULT_LOCALE,
  type Locale,
  type TranslationBundle,
} from './index';
import { loadHomeMessages } from './messages/home';
import { loadGames } from './messages/games/load-games';

/** Lazy-load only the `seo` namespace for a given locale. */
export async function loadSeo(locale: Locale) {
  switch (locale) {
    case 'en':
      return (await import('./messages/seo/en')).en;
    case 'es':
      return (await import('./messages/seo/es')).es;
    case 'fr':
      return (await import('./messages/seo/fr')).fr;
    case 'ru':
      return (await import('./messages/seo/ru')).ru;
    case 'by':
      return (await import('./messages/seo/by')).by;
    default:
      return (await import('./messages/seo/en')).en;
  }
}

/**
 * Server-side utility to load translations.
 *
 * Prefer passing a locale (typically from `params.locale` on a page in the
 * `[locale]` segment). If omitted, falls back to the `app-language` cookie,
 * then the default locale.
 */
export async function getTranslations(
  locale?: Locale,
): Promise<TranslationBundle> {
  return loadMessages(locale ?? (await getServerLocale()));
}

/**
 * Lightweight alternative to `getTranslations` that loads only the
 * `home` and `games` translation namespaces. Keeps the RSC flight
 * payload small for pages that don't need the full bundle (e.g. the
 * marketing home page).
 */
export async function getHomeTranslations(locale?: Locale) {
  const loc = locale ?? (await getServerLocale());
  const [home, games] = await Promise.all([
    loadHomeMessages(loc),
    loadGames(loc),
  ]);
  return { home, games };
}

/**
 * Load only the namespaces that client components need on the initial
 * render of the home page. Much smaller than the full bundle (~5 vs
 * 20+ modules) but eliminates "missing translation" warnings during
 * hydration when `requestIdleCallback` hasn't fired yet.
 *
 * Namespaces included: navigation, games, home, pwa, common.
 */
export async function getInitialTranslations(
  locale?: Locale,
): Promise<TranslationBundle> {
  const loc = locale ?? (await getServerLocale());
  const [
    navigationMod,
    pwaMod,
    commonMod,
    homeData,
    gamesData,
    settingsMod,
    notificationsMod,
    battlePassMod,
    referralsMod,
    legalMod,
    chatMod,
  ] = await Promise.all([
    import('./messages/navigation'),
    import('./messages/pwa'),
    import('./messages/common'),
    loadHomeMessages(loc),
    loadGames(loc),
    import('./messages/settings'),
    import('./messages/notifications'),
    import('./messages/battle-pass'),
    import('./messages/referrals'),
    import('./messages/legal'),
    import('./messages/chat'),
  ]);
  return {
    common: commonMod[loc],
    pages: {} as TranslationBundle['pages'],
    home: homeData,
    settings: settingsMod[loc],
    support: {} as TranslationBundle['support'],
    auth: {} as TranslationBundle['auth'],
    navigation: navigationMod[loc],
    chat: chatMod.chatMessages[loc],
    chatList: chatMod.chatListMessages[loc],
    games: gamesData as TranslationBundle['games'],
    history: {} as TranslationBundle['history'],
    payments: {} as TranslationBundle['payments'],
    legal: legalMod[loc],
    stats: {} as TranslationBundle['stats'],
    pwa: pwaMod[loc],
    referrals: referralsMod[loc],
    seo: {} as TranslationBundle['seo'],
    notifications: notificationsMod[loc],
    battlePass: battlePassMod[loc],
    musicPlayer: {} as TranslationBundle['musicPlayer'],
    wallet: {} as TranslationBundle['wallet'],
  };
}

/**
 * Read the current locale on the server. Pages in the `[locale]` segment
 * should pass `params.locale` directly to `getTranslations`; this helper
 * is for top-level layouts and standalone server routes.
 */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get('app-language')?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}
