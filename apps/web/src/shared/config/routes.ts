// Note: this module is imported by `app-config.ts`. To avoid a circular
// import with the i18n message bundles (which depend on `app-config`),
// the locale type is defined locally rather than imported from
// `@/shared/i18n`. Keep in sync with `src/shared/i18n/types.ts`.
type Locale = 'en' | 'es' | 'fr' | 'ru' | 'by';
const DEFAULT_LOCALE: Locale = 'en';

/**
 * Locale-aware route builder. Every URL in the app carries the locale prefix
 * (e.g. `/en/games`, `/fr/settings`). Use `useRoutes()` in client components
 * and `buildRoutes(locale)` in server components / metadata.
 */
export const buildRoutes = (locale: Locale) => ({
  // Main pages
  home: `/${locale}`,
  auth: `/${locale}/auth`,
  authCallback: `/${locale}/auth/callback`,

  // Games
  games: `/${locale}/games`,
  gameDetail: (id: string) => `/${locale}/games/${id}`,
  gameCreate: `/${locale}/games/create`,
  gameRoom: (id: string) => `/${locale}/games/rooms/${id}`,
  seaBattleLanding: `/${locale}/games/sea-battle`,

  // Chat
  chats: `/${locale}/chats`,
  chat: `/${locale}/chat`,
  chatDetail: (id: string) => `/${locale}/chat/${id}`,

  // User
  settings: `/${locale}/settings`,
  history: `/${locale}/history`,
  stats: `/${locale}/stats`,
  referrals: `/${locale}/referrals`,

  // Admin
  admin: `/${locale}/admin`,
  adminUsers: `/${locale}/admin/users`,

  // Support & Payments
  support: `/${locale}/support`,
  payment: `/${locale}/payment`,
  paymentSuccess: `/${locale}/payment/success`,
  paymentCancel: `/${locale}/payment/cancel`,
  notes: `/${locale}/notes`,

  // Legal
  terms: `/${locale}/terms`,
  privacy: `/${locale}/privacy`,
  contact: `/${locale}/contact`,
  cookies: `/${locale}/cookies`,
  help: `/${locale}/help`,

  // Community & Content
  blog: `/${locale}/blog`,
  community: `/${locale}/community`,
  rewards: `/${locale}/rewards`,
  tournaments: `/${locale}/tournaments`,
  wallet: `/${locale}/wallet`,
  shop: `/${locale}/shop`,
  leaderboards: `/${locale}/leaderboards`,
  developers: `/${locale}/developers`,

  // System (locale-free)
  offline: '/offline',
  testCrash: `/${locale}/test-crash`,
});

export type Routes = ReturnType<typeof buildRoutes>;

/**
 * Default-locale routes — used in static contexts where we cannot read
 * the active locale (sitemap, e2e seed data, server modules without
 * params). Middleware will redirect client-side navigation that lands
 * on these to the user's preferred locale.
 */
export const routes: Routes = buildRoutes(DEFAULT_LOCALE);

export type RoutePath = string;
