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
    rooms: `/${locale}/${s('rooms')}`,
    gameDetail: (id: string) => `/${locale}/${s('games')}/${id}`,
    gameCreate: `/${locale}/${s('games')}/create`,
    gameRoom: (id: string) => `/${locale}/${s('rooms')}/${id}`,
    seaBattleLanding: `/${locale}/${s('games')}/sea-battle`,
    battleshipLanding: `/${locale}/${s('games')}/battleship`,
    criticalLanding: `/${locale}/${s('games')}/critical`,
    glimwormLanding: `/${locale}/${s('games')}/glimworm`,
    ticTacToe: `/${locale}/${s('games')}/tic-tac-toe`,
    ticTacToeLanding: `/${locale}/${s('games')}/tic-tac-toe`,
    cascade: `/${locale}/${s('games')}/cascade`,
    cascadeLanding: `/${locale}/${s('games')}/cascade`,
    chess: `/${locale}/${s('games')}/chess`,
    chessLanding: `/${locale}/${s('games')}/chess`,
    checkers: `/${locale}/${s('games')}/checkers`,
    checkersLanding: `/${locale}/${s('games')}/checkers`,
    catDash: `/${locale}/${s('games')}/cat-dash`,
    catDashLanding: `/${locale}/${s('games')}/cat-dash`,
    backgammon: `/${locale}/${s('games')}/backgammon`,
    backgammonLanding: `/${locale}/${s('games')}/backgammon`,
    hearts: `/${locale}/${s('games')}/hearts`,
    heartsLanding: `/${locale}/${s('games')}/hearts`,
    spades: `/${locale}/${s('games')}/spades`,
    spadesLanding: `/${locale}/${s('games')}/spades`,
    go: `/${locale}/${s('games')}/go`,
    goLanding: `/${locale}/${s('games')}/go`,
    pachisi: `/${locale}/${s('games')}/pachisi`,
    pachisiLanding: `/${locale}/${s('games')}/pachisi`,
    solitaire: `/${locale}/${s('games')}/solitaire`,
    solitaireLanding: `/${locale}/${s('games')}/solitaire`,
    solitairePlay: `/${locale}/${s('games')}/solitaire/play`,
    minesweeper: `/${locale}/${s('games')}/minesweeper`,
    minesweeperLanding: `/${locale}/${s('games')}/minesweeper`,
    minesweeperPlay: `/${locale}/${s('games')}/minesweeper/play`,
    sudoku: `/${locale}/${s('games')}/sudoku`,
    sudokuLanding: `/${locale}/${s('games')}/sudoku`,
    sudokuPlay: `/${locale}/${s('games')}/sudoku/play`,
    game2048: `/${locale}/${s('games')}/2048`,
    game2048Landing: `/${locale}/${s('games')}/2048`,
    game2048Play: `/${locale}/${s('games')}/2048/play`,

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
    adminStatistics: `/${locale}/${s('admin')}/statistics`,

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
    features: `/${locale}/${s('features')}`,
    roadmap: `/${locale}/${s('roadmap')}`,
    changelog: `/${locale}/${s('changelog')}`,

    // Community & Content
    blog: `/${locale}/${s('blog')}`,
    blogPost: (slug: string) => `/${locale}/${s('blog')}/${slug}`,
    community: `/${locale}/${s('community')}`,
    rewards: `/${locale}/${s('rewards')}`,
    tournaments: `/${locale}/${s('tournaments')}`,
    wallet: `/${locale}/${s('wallet')}`,
    token: `/${locale}/${s('token')}`,
    shop: `/${locale}/${s('shop')}`,
    // Literal segment (no localized slug) — keeps the path stable across locales.
    battlePass: `/${locale}/battle-pass`,
    shopInventory: `/${locale}/${s('shop')}/inventory`,
    leaderboards: `/${locale}/${s('leaderboards')}`,
    friends: `/${locale}/${s('friends')}`,
    clans: `/${locale}/${s('clans')}`,
    events: `/${locale}/${s('events')}`,
    eventDetail: (id: string) => `/${locale}/${s('events')}/${id}`,
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
