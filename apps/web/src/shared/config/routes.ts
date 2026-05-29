import { DEFAULT_LOCALE, slugFor, type Locale } from './locale-slugs';

/**
 * Locale-aware route builder. Every URL carries the locale prefix and a
 * locale-specific top-level slug (e.g. `/en/games`, `/fr/jeux`,
 * `/es/juegos`). Use `useRoutes()` in client components and
 * `buildRoutes(locale)` in server components / metadata.
 */
export const buildRoutes = (locale: Locale) => {
  const s = (key: Parameters<typeof slugFor>[1]) => slugFor(locale, key);

  return {
    // Main pages
    home: `/${locale}`,
    auth: `/${locale}/${s('auth')}`,
    authCallback: `/${locale}/${s('auth')}/callback`,

    // Games (top-level segment is translated; nested segments stay in
    // English to keep the diff scoped to the SEO-relevant keyword).
    games: `/${locale}/${s('games')}`,
    gameDetail: (id: string) => `/${locale}/${s('games')}/${id}`,
    gameCreate: `/${locale}/${s('games')}/create`,
    gameRoom: (id: string) => `/${locale}/${s('games')}/rooms/${id}`,
    seaBattleLanding: `/${locale}/${s('games')}/sea-battle`,
    criticalLanding: `/${locale}/${s('games')}/critical`,
    glimwormLanding: `/${locale}/${s('games')}/glimworm`,
    ticTacToe: `/${locale}/${s('games')}/tic-tac-toe`,
    ticTacToeLanding: `/${locale}/${s('games')}/tic-tac-toe`,
    cascade: `/${locale}/${s('games')}/cascade`,
    cascadeLanding: `/${locale}/${s('games')}/cascade`,

    // Chat
    chats: `/${locale}/${s('chats')}`,
    chat: `/${locale}/${s('chat')}`,
    chatDetail: (id: string) => `/${locale}/${s('chat')}/${id}`,

    // User
    settings: `/${locale}/${s('settings')}`,
    history: `/${locale}/${s('history')}`,
    stats: `/${locale}/${s('stats')}`,
    referrals: `/${locale}/${s('referrals')}`,

    // Admin
    admin: `/${locale}/${s('admin')}`,
    adminUsers: `/${locale}/${s('admin')}/users`,

    // Support & Payments
    support: `/${locale}/${s('support')}`,
    payment: `/${locale}/${s('payment')}`,
    paymentSuccess: `/${locale}/${s('payment')}/success`,
    paymentCancel: `/${locale}/${s('payment')}/cancel`,
    notes: `/${locale}/${s('notes')}`,

    // Legal
    terms: `/${locale}/${s('terms')}`,
    privacy: `/${locale}/${s('privacy')}`,
    contact: `/${locale}/${s('contact')}`,
    cookies: `/${locale}/${s('cookies')}`,
    help: `/${locale}/${s('help')}`,

    // Community & Content
    blog: `/${locale}/${s('blog')}`,
    blogPost: (slug: string) => `/${locale}/${s('blog')}/${slug}`,
    community: `/${locale}/${s('community')}`,
    rewards: `/${locale}/${s('rewards')}`,
    tournaments: `/${locale}/${s('tournaments')}`,
    wallet: `/${locale}/${s('wallet')}`,
    shop: `/${locale}/${s('shop')}`,
    // Literal segment (no localized slug) — keeps the path stable across locales.
    battlePass: `/${locale}/battle-pass`,
    shopInventory: `/${locale}/${s('shop')}/inventory`,
    leaderboards: `/${locale}/${s('leaderboards')}`,
    developers: `/${locale}/${s('developers')}`,

    // System (locale-free)
    offline: '/offline',
    testCrash: `/${locale}/test-crash`,
  };
};

export type Routes = ReturnType<typeof buildRoutes>;

/**
 * Default-locale (English) routes — used in static contexts where we
 * cannot read the active locale (sitemap fallbacks, e2e seed data,
 * server modules without params). Middleware redirects client-side
 * navigation that lands on these to the user's preferred locale.
 */
export const routes: Routes = buildRoutes(DEFAULT_LOCALE);

export type RoutePath = string;
export type { Locale };
