// Per-locale URL slugs for the top-level path segment after the locale
// prefix. The file system directory layout under `src/app/[locale]/*`
// uses the English slugs; non-English locale URLs are localized via
// `rewrites()` in next.config (URL → filesystem) and `redirects()`
// (English-slug-in-locale → localized canonical).
//
// Imported by routes.ts, proxy.ts, and next.config.ts. Keep this
// file dependency-free — routes.ts is imported transitively by
// app-config.ts, which would create a cycle if we pulled in the i18n
// message bundles here.

export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'ru', 'by'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Canonical (English) slug keys. Each value is the directory name under
 * `src/app/[locale]/` so the keys map 1:1 to filesystem segments.
 */
export const EN_SLUGS = {
  auth: 'auth',
  games: 'games',
  chat: 'chat',
  chats: 'chats',
  settings: 'settings',
  history: 'history',
  stats: 'stats',
  referrals: 'referrals',
  admin: 'admin',
  support: 'support',
  payment: 'payment',
  notes: 'notes',
  terms: 'terms',
  privacy: 'privacy',
  contact: 'contact',
  cookies: 'cookies',
  help: 'help',
  roadmap: 'roadmap',
  blog: 'blog',
  community: 'community',
  rewards: 'rewards',
  tournaments: 'tournaments',
  wallet: 'wallet',
  token: 'token',
  shop: 'shop',
  leaderboards: 'leaderboards',
  friends: 'friends',
  developers: 'developers',
  players: 'players',
} as const;

export type SlugKey = keyof typeof EN_SLUGS;

/**
 * Localized first-segment slugs per locale. Nested segments
 * (e.g. `games/create`, `games/rooms`, `payment/success`) stay in
 * English to keep the change scoped to the top-level keyword.
 *
 * Cyrillic locales (ru, by) use ASCII transliteration for cleaner
 * encoded URLs in browsers and Search Console.
 */
export const LOCALE_SLUGS: Record<Locale, Record<SlugKey, string>> = {
  en: { ...EN_SLUGS },
  es: {
    auth: 'acceso',
    games: 'juegos',
    chat: 'chat',
    chats: 'chats',
    settings: 'ajustes',
    history: 'historial',
    stats: 'estadisticas',
    referrals: 'referidos',
    admin: 'admin',
    support: 'soporte',
    payment: 'pago',
    notes: 'notas',
    terms: 'terminos',
    privacy: 'privacidad',
    contact: 'contacto',
    cookies: 'cookies',
    help: 'ayuda',
    roadmap: 'hoja-de-ruta',
    blog: 'blog',
    community: 'comunidad',
    rewards: 'recompensas',
    tournaments: 'torneos',
    wallet: 'cartera',
    token: 'token',
    shop: 'tienda',
    leaderboards: 'clasificaciones',
    friends: 'amigos',
    developers: 'desarrolladores',
    players: 'jugadores',
  },
  fr: {
    auth: 'connexion',
    games: 'jeux',
    chat: 'chat',
    chats: 'discussions',
    settings: 'parametres',
    history: 'historique',
    stats: 'statistiques',
    referrals: 'parrainage',
    admin: 'admin',
    support: 'support',
    payment: 'paiement',
    notes: 'notes',
    terms: 'conditions',
    privacy: 'confidentialite',
    contact: 'contact',
    cookies: 'cookies',
    help: 'aide',
    roadmap: 'feuille-de-route',
    blog: 'blog',
    community: 'communaute',
    rewards: 'recompenses',
    tournaments: 'tournois',
    wallet: 'portefeuille',
    token: 'token',
    shop: 'boutique',
    leaderboards: 'classements',
    friends: 'amis',
    developers: 'developpeurs',
    players: 'joueurs',
  },
  ru: {
    auth: 'vhod',
    games: 'igry',
    chat: 'chat',
    chats: 'chaty',
    settings: 'nastroyki',
    history: 'istoriya',
    stats: 'statistika',
    referrals: 'priglasheniya',
    admin: 'admin',
    support: 'podderzhka',
    payment: 'oplata',
    notes: 'zametki',
    terms: 'usloviya',
    privacy: 'konfidentsialnost',
    contact: 'kontakty',
    cookies: 'cookies',
    help: 'pomoshch',
    roadmap: 'dorozhnaya-karta',
    blog: 'blog',
    community: 'soobshchestvo',
    rewards: 'nagrady',
    tournaments: 'turniry',
    wallet: 'koshelek',
    token: 'token',
    shop: 'magazin',
    leaderboards: 'lidery',
    friends: 'druzia',
    developers: 'razrabotchiki',
    players: 'igroki',
  },
  by: {
    auth: 'uvakhod',
    games: 'hulni',
    chat: 'chat',
    chats: 'chaty',
    settings: 'nalady',
    history: 'historya',
    stats: 'statystyka',
    referrals: 'zaprashenne',
    admin: 'admin',
    support: 'padtrymka',
    payment: 'aplata',
    notes: 'natatki',
    terms: 'umovy',
    privacy: 'pryvatnasc',
    contact: 'kantakty',
    cookies: 'cookies',
    help: 'dapamoga',
    roadmap: 'darozhnaya-karta',
    blog: 'blog',
    community: 'supolnasc',
    rewards: 'uznagarody',
    tournaments: 'turniry',
    wallet: 'kashalek',
    token: 'token',
    shop: 'krama',
    leaderboards: 'lidery',
    friends: 'siaqry',
    developers: 'raspracoushchyki',
    players: 'hultsy',
  },
};

/**
 * Inverse map: localized slug -> canonical English key, per locale.
 * Used by the middleware to recognize incoming URLs that mix locale
 * with English slugs (legacy bookmarks) and redirect to the canonical
 * localized form in one hop.
 */
export const LOCALIZED_SLUG_TO_KEY: Record<
  Locale,
  Record<string, SlugKey>
> = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [
    locale,
    Object.fromEntries(
      Object.entries(LOCALE_SLUGS[locale]).map(([key, slug]) => [
        slug,
        key as SlugKey,
      ]),
    ),
  ]),
) as Record<Locale, Record<string, SlugKey>>;

/**
 * Returns the canonical localized slug for `key` in `locale`.
 */
export function slugFor(locale: Locale, key: SlugKey): string {
  return LOCALE_SLUGS[locale][key];
}

/**
 * Returns the canonical English slug for the localized slug `slug`
 * under `locale`, if the slug is recognized. Used by middleware to
 * rewrite legacy URLs to the canonical localized form.
 */
export function canonicalKeyFor(
  locale: Locale,
  slug: string,
): SlugKey | undefined {
  return LOCALIZED_SLUG_TO_KEY[locale]?.[slug];
}
