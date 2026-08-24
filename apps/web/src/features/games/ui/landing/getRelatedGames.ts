import { buildRoutes } from '@/shared/config/routes';
import type { Locale } from '@/shared/i18n';
import type { RelatedGameCard } from './types';

interface GameInfo {
  slug: string;
  name: string;
  category: string;
  players: string;
  description: string;
  path: (routes: ReturnType<typeof buildRoutes>) => string;
}

const ALL_GAMES: GameInfo[] = [
  {
    slug: 'chess_v1',
    name: 'Chess',
    category: 'Board Game',
    players: '2 Players',
    description:
      'The timeless strategy duel with clocks, classic modes, and Chess960 variants.',
    path: (r) => r.chessLanding,
  },
  {
    slug: 'sea_battle_v1',
    name: 'Sea Battle',
    category: 'Strategy',
    players: '2–4 Players',
    description:
      'Command your fleet, strategically position ships, and strike enemy coordinates.',
    path: (r) => r.seaBattleLanding,
  },
  {
    slug: 'checkers_v1',
    name: 'Checkers',
    category: 'Board Game',
    players: '2 Players',
    description:
      'Fast-paced board tactics with forced jump sequences and king piece upgrades.',
    path: (r) => r.checkersLanding,
  },
  {
    slug: 'tic_tac_toe_v1',
    name: 'Tic-Tac-Toe',
    category: 'Casual',
    players: '2–5 Players',
    description:
      'Grid battle from 3×3 to 9×9 boards with custom themes and win lengths.',
    path: (r) => r.ticTacToeLanding,
  },
  {
    slug: 'cascade_v1',
    name: 'Cascade',
    category: 'Card Game',
    players: '2–10 Players',
    description:
      'Crazy Eights shedding action with fast card combos, color changes, and theme decks.',
    path: (r) => r.cascadeLanding,
  },
  {
    slug: 'cat_dash_v1',
    name: 'Cat Dash',
    category: 'Race',
    players: '2–6 Players',
    description:
      'High-energy feline racing board with dice rolls, dash abilities, and obstacles.',
    path: (r) => r.catDashLanding,
  },
  {
    slug: 'glimworm_v1',
    name: 'Glimworm',
    category: 'Action',
    players: '2–10 Players',
    description:
      'Glow snake multiplayer arena where fast turns and tactical trapping reign supreme.',
    path: (r) => r.glimwormLanding,
  },
  {
    slug: 'critical_v1',
    name: 'Critical',
    category: 'Card Game',
    players: '2–5 Players',
    description:
      'Tense card party survival: defuse bombs, attack opponents, and avoid exploding.',
    path: (r) => r.criticalLanding,
  },
  {
    slug: 'backgammon_v1',
    name: 'Backgammon',
    category: 'Board Game',
    players: '2 Players',
    description:
      'Classic 24-point board game with dice rolls, bearing off, and AI bot opponents.',
    path: (r) => r.backgammonLanding,
  },
];

export function getRelatedGames(
  locale: Locale,
  currentSlug: string,
  translatedGames?: Record<
    string,
    { name?: string; description?: string } | undefined
  >,
): RelatedGameCard[] {
  const routes = buildRoutes(locale);

  return ALL_GAMES.filter((g) => g.slug !== currentSlug).map((g) => {
    const t = translatedGames?.[g.slug];
    return {
      slug: g.slug,
      name: t?.name ?? g.name,
      category: g.category,
      players: g.players,
      description: t?.description ?? g.description,
      href: g.path(routes),
    };
  });
}
