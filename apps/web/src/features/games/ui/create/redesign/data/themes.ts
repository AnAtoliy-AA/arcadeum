export type GameId =
  | 'critical_v1'
  | 'sea_battle_v1'
  | 'glimworm_v1'
  | 'tic_tac_toe_v1'
  | 'cascade_v1'
  | 'chess_v1'
  | 'checkers_v1'
  | 'cat_dash_v1'
  | 'backgammon_v1'
  | 'hearts_v1'
  | 'spades_v1'
  | 'go_v1'
  | 'pachisi_v1';

export interface GameMeta {
  id: GameId;
  title: string;
  desc: string;
  players: { min: number; max: number; label: string };
  duration: string;
  kind: string;
  category: string;
  hasExpansion: boolean;
  hasThemes: boolean;
  rules: ReadonlyArray<'combos' | 'idle' | 'teams' | 'spectators'>;
}

export const GAMES: Record<GameId, GameMeta> = {
  critical_v1: {
    id: 'critical_v1',
    title: 'Critical',
    desc: 'A strategic card game where you avoid critical hazards.',
    players: { min: 2, max: 6, label: '2–6' },
    duration: '12 min',
    kind: 'Card · bluff',
    category: 'Card Game',
    hasExpansion: true,
    hasThemes: true,
    rules: ['combos', 'idle', 'spectators'],
  },
  sea_battle_v1: {
    id: 'sea_battle_v1',
    title: 'Sea Battle',
    desc: 'Classic naval combat for up to 6 players.',
    players: { min: 2, max: 6, label: '2–6' },
    duration: '20 min',
    kind: 'Strategy',
    category: 'Strategy',
    hasExpansion: false,
    hasThemes: true,
    rules: ['idle', 'teams', 'spectators'],
  },
  glimworm_v1: {
    id: 'glimworm_v1',
    title: 'Glimworm',
    desc: 'A glow-in-the-dark snake battle for 2–10 players.',
    players: { min: 2, max: 10, label: '2–10' },
    duration: '8 min',
    kind: 'Arcade',
    category: 'Action',
    hasExpansion: false,
    hasThemes: true,
    rules: ['idle', 'spectators'],
  },
  tic_tac_toe_v1: {
    id: 'tic_tac_toe_v1',
    title: 'Tic-Tac-Toe',
    desc: 'Classic 3-in-a-row with themed variants and 3×3 – 9×9 boards.',
    players: { min: 2, max: 4, label: '2–4' },
    duration: '5 min',
    kind: 'Board',
    category: 'Board Game',
    hasExpansion: false,
    hasThemes: true,
    rules: ['teams', 'spectators'],
  },
  cascade_v1: {
    id: 'cascade_v1',
    title: 'Cascade',
    desc: 'Shedding card game in the Crazy Eights family — stack penalties and four selectable themes.',
    players: { min: 2, max: 10, label: '2–10' },
    duration: '10 min',
    kind: 'Card · matching',
    category: 'Card Game',
    hasExpansion: false,
    hasThemes: true,
    rules: ['idle', 'spectators'],
  },
  chess_v1: {
    id: 'chess_v1',
    title: 'Chess',
    desc: 'The classic strategy board game with standard and Chess960 variants.',
    players: { min: 2, max: 2, label: '2' },
    duration: '15 min',
    kind: 'Board · strategy',
    category: 'Board Game',
    hasExpansion: false,
    hasThemes: true,
    rules: ['idle', 'spectators'],
  },
  checkers_v1: {
    id: 'checkers_v1',
    title: 'Checkers',
    desc: 'Classic 8×8 checkers with forced captures, multi-jump, and king promotion.',
    players: { min: 2, max: 2, label: '2' },
    duration: '20 min',
    kind: 'Board · strategy',
    category: 'Board Game',
    hasExpansion: false,
    hasThemes: true,
    rules: ['idle', 'spectators'],
  },
  cat_dash_v1: {
    id: 'cat_dash_v1',
    title: 'Cat Dash',
    desc: 'A cat racing dice game with unique abilities and themed tracks.',
    players: { min: 2, max: 6, label: '2–6' },
    duration: '10 min',
    kind: 'Dice · race',
    category: 'Dice Game',
    hasExpansion: false,
    hasThemes: true,
    rules: ['idle', 'spectators', 'teams'],
  },
  backgammon_v1: {
    id: 'backgammon_v1',
    title: 'Backgammon',
    desc: 'Classic 24-point board game with dice rolls, bearing off, and AI opponents.',
    players: { min: 2, max: 2, label: '2' },
    duration: '20 min',
    kind: 'Board · race',
    category: 'Board Game',
    hasExpansion: false,
    hasThemes: true,
    rules: ['idle', 'spectators'],
  },
  hearts_v1: {
    id: 'hearts_v1',
    title: 'Hearts',
    desc: 'Classic 4-player trick-taking card game — avoid penalty cards and shoot the moon.',
    players: { min: 4, max: 4, label: '4' },
    duration: '30 min',
    kind: 'Card · trick-taking',
    category: 'Card Game',
    hasExpansion: false,
    hasThemes: true,
    rules: ['idle', 'spectators'],
  },
  spades_v1: {
    id: 'spades_v1',
    title: 'Spades',
    desc: 'Classic 4-player partnership card game — bid your tricks and let spades trump.',
    players: { min: 4, max: 4, label: '4' },
    duration: '35 min',
    kind: 'Card · partnership',
    category: 'Card Game',
    hasExpansion: false,
    hasThemes: true,
    rules: ['idle', 'spectators'],
  },
  go_v1: {
    id: 'go_v1',
    title: 'Go',
    desc: 'Classic Go on 9×9–19×19 boards — surround territory, capture groups, and beat the MCTS bot.',
    players: { min: 2, max: 2, label: '2' },
    duration: '10–40 min',
    kind: 'Board · territory',
    category: 'Board Game',
    hasExpansion: false,
    hasThemes: true,
    rules: ['idle', 'spectators'],
  },
  pachisi_v1: {
    id: 'pachisi_v1',
    title: 'Pachisi',
    desc: 'Classic cross-and-circle race for 2–4 players — roll a six, capture rivals, race home.',
    players: { min: 2, max: 4, label: '2–4' },
    duration: '15 min',
    kind: 'Board · race',
    category: 'Board Game',
    hasExpansion: false,
    hasThemes: true,
    rules: ['idle', 'spectators'],
  },
};

export const VISIBLE_GAMES: GameId[] = [
  'critical_v1',
  'sea_battle_v1',
  'glimworm_v1',
  'tic_tac_toe_v1',
  'cascade_v1',
  'chess_v1',
  'checkers_v1',
  'cat_dash_v1',
  'backgammon_v1',
  'hearts_v1',
  'spades_v1',
  'go_v1',
  'pachisi_v1',
];

export function getGamesByCategory(): Array<{
  category: string;
  games: GameId[];
}> {
  const map = new Map<string, GameId[]>();
  for (const id of VISIBLE_GAMES) {
    const cat = GAMES[id].category;
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(id);
  }
  return Array.from(map.entries()).map(([category, games]) => ({
    category,
    games,
  }));
}

export interface CriticalTheme {
  id: string;
  name: string;
  desc: string;
  color: string;
  accent: string;
  glyph: string;
  cardName: string;
  effect: string;
}

const CRITICAL_EXTRA: Record<
  string,
  { glyph: string; cardName: string; effect: string }
> = {
  cyberpunk: {
    glyph: '⚠',
    cardName: 'SYSTEM OVERLOAD',
    effect: 'Defuse or you explode.',
  },
  underwater: {
    glyph: '≋',
    cardName: 'HULL BREACH',
    effect: 'Patch the leak or sink.',
  },
  crime: {
    glyph: '⏲',
    cardName: 'VAULT ALARM',
    effect: 'Disarm or every cop hears it.',
  },
  horror: {
    glyph: '☠',
    cardName: 'CURSED TOAST',
    effect: 'Pass the wine or you’re next.',
  },
  adventure: {
    glyph: '◐',
    cardName: 'TRAP TRIGGERED',
    effect: 'Spot the seam or get crushed.',
  },
  'high-altitude-hike': {
    glyph: '△',
    cardName: 'AVALANCHE',
    effect: 'Anchor in or get buried.',
  },
  galaxy: {
    glyph: '✦',
    cardName: 'STAR COLLAPSE',
    effect: 'Stabilize the core or vanish.',
  },
  fantasy: {
    glyph: '◈',
    cardName: 'DRAGON WAKES',
    effect: 'Sheathe the steel or burn.',
  },
  western: {
    glyph: '✸',
    cardName: 'QUICK DRAW',
    effect: 'Holster up or eat lead.',
  },
  egypt: {
    glyph: '☥',
    cardName: 'PHARAOH WAKES',
    effect: 'Speak the spell or be sealed.',
  },
  steampunk: {
    glyph: '⚙',
    cardName: 'BOILER BURST',
    effect: 'Vent the pressure or rupture.',
  },
  zen: {
    glyph: '☯',
    cardName: 'GONG STRIKES',
    effect: 'Breathe or shatter.',
  },
};

import { SHARED_THEMES } from '@/features/games/lib/shared-themes';

export const CRITICAL_THEMES: CriticalTheme[] = SHARED_THEMES.filter(
  (t) => t.id !== 'random',
).map((t) => ({
  id: t.id,
  name: t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/-/g, ' '),
  desc: t.descriptionKey,
  color: t.colors.primary,
  accent: t.colors.accent,
  glyph: CRITICAL_EXTRA[t.id]?.glyph ?? '✦',
  cardName: CRITICAL_EXTRA[t.id]?.cardName ?? 'CRITICAL HAZARD',
  effect: CRITICAL_EXTRA[t.id]?.effect ?? 'Defuse or you explode.',
}));

export interface SeaBattleThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
  palette: {
    bg: string;
    cell: string;
    ship: string;
    hit: string;
    miss: string;
  };
}

export const SEA_BATTLE_THEMES: SeaBattleThemeMeta[] = SHARED_THEMES.filter(
  (t) => t.id !== 'random',
).map((t) => ({
  id: t.id,
  name: t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/-/g, ' '),
  desc: t.descriptionKey,
  color: t.colors.primary,
  palette: {
    bg: t.colors.background,
    cell: t.colors.surface,
    ship: t.colors.primary,
    hit: '#ef4444',
    miss: t.colors.textSecondary,
  },
}));

import {
  TIC_TAC_TOE_THEMES,
  findTicTacToeTheme,
  type TicTacToeThemeMeta,
} from './tic-tac-toe-themes';
import {
  CASCADE_THEMES,
  findCascadeTheme,
  type CascadeThemeMeta,
} from './cascade-themes';
import {
  CHESS_THEMES,
  findChessTheme,
  type ChessThemeMeta,
} from './chess-themes';
import { CHECKERS_THEMES } from './checkers-themes';
import {
  CAT_DASH_THEMES,
  findCatDashTheme,
  type CatDashThemeMeta,
} from './cat-dash-themes';
import {
  BACKGAMMON_THEMES,
  findBackgammonTheme,
  type BackgammonThemeMeta,
} from './backgammon-themes';
import {
  HEARTS_THEMES,
  findHeartsTheme,
  type HeartsThemeMeta,
} from './hearts-themes';
import {
  SPADES_THEMES,
  findSpadesTheme,
  type SpadesThemeMeta,
} from './spades-themes';
import { GO_THEMES, findGoTheme, type GoThemeMeta } from './go-themes';
import {
  PACHISI_THEMES,
  findPachisiTheme,
  type PachisiThemeMeta,
} from './pachisi-themes';
export { TIC_TAC_TOE_THEMES, findTicTacToeTheme, type TicTacToeThemeMeta };
export { CASCADE_THEMES, findCascadeTheme, type CascadeThemeMeta };
export { CHESS_THEMES, findChessTheme, type ChessThemeMeta };
export { CAT_DASH_THEMES, findCatDashTheme, type CatDashThemeMeta };
export { BACKGAMMON_THEMES, findBackgammonTheme, type BackgammonThemeMeta };
export { HEARTS_THEMES, findHeartsTheme, type HeartsThemeMeta };
export { SPADES_THEMES, findSpadesTheme, type SpadesThemeMeta };
export { GO_THEMES, findGoTheme, type GoThemeMeta };
export { PACHISI_THEMES, findPachisiTheme, type PachisiThemeMeta };

export interface GlimwormThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
}

export const GLIMWORM_THEMES: GlimwormThemeMeta[] = SHARED_THEMES.filter(
  (t) => t.id !== 'random',
).map((t) => ({
  id: t.id,
  name: t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/-/g, ' '),
  desc: t.descriptionKey,
  color: t.colors.primary,
}));

export function themesFor(gameId: GameId) {
  if (gameId === 'critical_v1') return CRITICAL_THEMES;
  if (gameId === 'sea_battle_v1') return SEA_BATTLE_THEMES;
  if (gameId === 'tic_tac_toe_v1') return TIC_TAC_TOE_THEMES;
  if (gameId === 'cascade_v1') return CASCADE_THEMES;
  if (gameId === 'chess_v1') return CHESS_THEMES;
  if (gameId === 'checkers_v1') return CHECKERS_THEMES;
  if (gameId === 'cat_dash_v1') return CAT_DASH_THEMES;
  if (gameId === 'backgammon_v1') return BACKGAMMON_THEMES;
  if (gameId === 'glimworm_v1') return GLIMWORM_THEMES;
  if (gameId === 'hearts_v1') return HEARTS_THEMES;
  if (gameId === 'spades_v1') return SPADES_THEMES;
  if (gameId === 'go_v1') return GO_THEMES;
  if (gameId === 'pachisi_v1') return PACHISI_THEMES;
  return [];
}
export function findCriticalTheme(id: string | undefined): CriticalTheme {
  return CRITICAL_THEMES.find((t) => t.id === id) ?? CRITICAL_THEMES[0];
}
export function findSeaBattleTheme(id: string | undefined): SeaBattleThemeMeta {
  return SEA_BATTLE_THEMES.find((t) => t.id === id) ?? SEA_BATTLE_THEMES[0];
}
export { EXPANSION_PACK_LIST, type ExpansionPack } from './expansion-packs';
