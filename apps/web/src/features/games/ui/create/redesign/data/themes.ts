export type GameId =
  | 'critical_v1'
  | 'sea_battle_v1'
  | 'glimworm_v1'
  | 'tic_tac_toe_v1'
  | 'cascade_v1';

export interface GameMeta {
  id: GameId;
  title: string;
  desc: string;
  players: { min: number; max: number; label: string };
  duration: string;
  kind: string;
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
    hasExpansion: false,
    hasThemes: false,
    rules: ['idle', 'spectators'],
  },
  tic_tac_toe_v1: {
    id: 'tic_tac_toe_v1',
    title: 'Tic-Tac-Toe',
    desc: 'Classic 3-in-a-row with themed variants and 3×3 – 9×9 boards.',
    players: { min: 2, max: 4, label: '2–4' },
    duration: '5 min',
    kind: 'Board',
    hasExpansion: false,
    hasThemes: true,
    rules: ['teams', 'spectators'],
  },
  cascade_v1: {
    id: 'cascade_v1',
    title: 'Cascade',
    desc: 'UNO-style shedding card game with stacking penalties and four selectable themes.',
    players: { min: 2, max: 10, label: '2–10' },
    duration: '10 min',
    kind: 'Card · matching',
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
];

// Critical theme registry. The `id` here is the value sent to the API
// as the `cardVariant` and must match an existing entry in CARD_VARIANTS.
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

export const CRITICAL_THEMES: CriticalTheme[] = [
  {
    id: 'cyberpunk',
    name: 'The Short Circuit',
    desc: 'Cyberpunk hackers preventing system overload.',
    color: '#f472b6',
    accent: '#f9a8d4',
    glyph: '⚠',
    cardName: 'SYSTEM OVERLOAD',
    effect: 'Defuse or you explode.',
  },
  {
    id: 'underwater',
    name: 'Deep Sea Pressure',
    desc: 'Underwater horror in a leaking submarine.',
    color: '#38bdf8',
    accent: '#7dd3fc',
    glyph: '≋',
    cardName: 'HULL BREACH',
    effect: 'Patch the leak or sink.',
  },
  {
    id: 'crime',
    name: 'The Heist',
    desc: 'Crime noir theme with police raids and getaways.',
    color: '#fbbf24',
    accent: '#fcd34d',
    glyph: '⏲',
    cardName: 'VAULT ALARM',
    effect: 'Disarm or every cop hears it.',
  },
  {
    id: 'horror',
    name: 'The Cursed Banquet',
    desc: 'Social horror at a dark sorcerer party.',
    color: '#c084fc',
    accent: '#e9d5ff',
    glyph: '☠',
    cardName: 'CURSED TOAST',
    effect: 'Pass the wine or you’re next.',
  },
  {
    id: 'adventure',
    name: 'The Ancient Temple',
    desc: 'Survival adventure in a mysterious temple.',
    color: '#a78bfa',
    accent: '#c4b5fd',
    glyph: '◐',
    cardName: 'TRAP TRIGGERED',
    effect: 'Spot the seam or get crushed.',
  },
  {
    id: 'high-altitude-hike',
    name: 'High-Altitude Hike',
    desc: 'Survival adventure escaping an avalanche.',
    color: '#60a5fa',
    accent: '#93c5fd',
    glyph: '△',
    cardName: 'AVALANCHE',
    effect: 'Anchor in or get buried.',
  },
  {
    id: 'galaxy',
    name: 'Galaxy Drift',
    desc: 'Cosmic stakes — black holes and stellar collapse.',
    color: '#a855f7',
    accent: '#c4b5fd',
    glyph: '✦',
    cardName: 'STAR COLLAPSE',
    effect: 'Stabilize the core or vanish.',
  },
  {
    id: 'fantasy',
    name: 'Dragon Lair',
    desc: 'Knights, gold, and a sleeping dragon you woke up.',
    color: '#d4af37',
    accent: '#fef3c7',
    glyph: '◈',
    cardName: 'DRAGON WAKES',
    effect: 'Sheathe the steel or burn.',
  },
  {
    id: 'western',
    name: 'High Noon',
    desc: 'Dusty showdowns on a Wild West main street.',
    color: '#fb923c',
    accent: '#fde68a',
    glyph: '✸',
    cardName: 'QUICK DRAW',
    effect: 'Holster up or eat lead.',
  },
  {
    id: 'egypt',
    name: 'Cursed Tomb',
    desc: 'Pyramid raiders and pharaohs who do not forget.',
    color: '#f59e0b',
    accent: '#fde68a',
    glyph: '☥',
    cardName: 'PHARAOH WAKES',
    effect: 'Speak the spell or be sealed.',
  },
  {
    id: 'steampunk',
    name: 'Boiler Room',
    desc: 'Brass cogs, steam vents, and an unstable pressure gauge.',
    color: '#f97316',
    accent: '#fed7aa',
    glyph: '⚙',
    cardName: 'BOILER BURST',
    effect: 'Vent the pressure or rupture.',
  },
  {
    id: 'zen',
    name: 'Zen Garden',
    desc: 'Calm before the storm — paper lanterns and a ticking gong.',
    color: '#f472b6',
    accent: '#fbcfe8',
    glyph: '☯',
    cardName: 'GONG STRIKES',
    effect: 'Breathe or shatter.',
  },
];

// Sea Battle theme registry. Each `id` matches a SeaBattleVariant in
// `apps/web/src/widgets/SeaBattleGame/lib/constants.ts`.
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

export const SEA_BATTLE_THEMES: SeaBattleThemeMeta[] = [
  {
    id: 'classic',
    name: 'Classic',
    desc: 'Cobalt grids on dark navy — the original.',
    color: '#60a5fa',
    palette: {
      bg: '#0b1726',
      cell: '#1e293b',
      ship: '#94a3b8',
      hit: '#ef4444',
      miss: '#64748b',
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    desc: 'Glowing cyan grid over deep indigo.',
    color: '#57c3ff',
    palette: {
      bg: '#06011b',
      cell: '#0c0a2e',
      ship: '#57c3ff',
      hit: '#ff4b4b',
      miss: '#8f9bff',
    },
  },
  {
    id: 'pixel',
    name: 'Pixel',
    desc: 'Phosphor-green CRT board for arcade purists.',
    color: '#00ff00',
    palette: {
      bg: '#050110',
      cell: '#100a1c',
      ship: '#ffffff',
      hit: '#ff0000',
      miss: '#ffff00',
    },
  },
  {
    id: 'cartoon',
    name: 'Cartoon',
    desc: 'Sky-blue cells and crimson hits — light and friendly.',
    color: '#f43f5e',
    palette: {
      bg: '#bae6fd',
      cell: '#f1f5f9',
      ship: '#fbbf24',
      hit: '#f43f5e',
      miss: '#38bdf8',
    },
  },
  {
    id: 'cyber',
    name: 'Cyber',
    desc: 'Neon teal grid with violet salvos.',
    color: '#00fff2',
    palette: {
      bg: '#050505',
      cell: '#001414',
      ship: '#ffffff',
      hit: '#ff0055',
      miss: '#7000ff',
    },
  },
  {
    id: 'vintage',
    name: 'Vintage',
    desc: 'Parchment grids in sepia — chart-room calm.',
    color: '#8b4513',
    palette: {
      bg: '#f3e5ab',
      cell: '#ebe0b4',
      ship: '#8b4513',
      hit: '#a52a2a',
      miss: '#5c4033',
    },
  },
  {
    id: 'nebula',
    name: 'Nebula',
    desc: 'Star-flecked grid drifting through purple cloud.',
    color: '#b548ff',
    palette: {
      bg: '#020024',
      cell: '#0a0a32',
      ship: '#ffffff',
      hit: '#ff4081',
      miss: '#00d4ff',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    desc: 'Topographic green-on-moss for the patient admiral.',
    color: '#4a6741',
    palette: {
      bg: '#0a140d',
      cell: '#0f1912',
      ship: '#2d3a2a',
      hit: '#bc4749',
      miss: '#d4a373',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    desc: 'Coral grid over deepening dusk and violet sky.',
    color: '#f59e0b',
    palette: {
      bg: '#4c1d95',
      cell: '#000000',
      ship: '#ffffff',
      hit: '#ef4444',
      miss: '#f59e0b',
    },
  },
  {
    id: 'monochrome',
    name: 'Mono',
    desc: 'Pure black ink on bone — competition-grade.',
    color: '#ffffff',
    palette: {
      bg: '#000000',
      cell: '#0a0a0a',
      ship: '#444444',
      hit: '#ffffff',
      miss: '#222222',
    },
  },
];

export interface TicTacToeThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
}

export const TIC_TAC_TOE_THEMES: TicTacToeThemeMeta[] = [
  {
    id: 'classic',
    name: 'Classic',
    desc: 'Crisp black grid on paper white.',
    color: '#1f2937',
  },
  {
    id: 'neon',
    name: 'Neon',
    desc: 'Glowing violet and cyan marks.',
    color: '#a855f7',
  },
  {
    id: 'paper',
    name: 'Paper',
    desc: 'Handwritten on warm parchment.',
    color: '#92400e',
  },
  {
    id: 'pixel',
    name: 'Pixel',
    desc: 'Retro 8-bit greens.',
    color: '#22c55e',
  },
  {
    id: 'chalkboard',
    name: 'Chalkboard',
    desc: 'Loose chalk strokes on slate.',
    color: '#e5e7eb',
  },
  {
    id: 'retro',
    name: 'Retro TV',
    desc: 'Sunset amber and warm red.',
    color: '#f59e0b',
  },
];

import {
  CASCADE_THEMES,
  findCascadeTheme,
  type CascadeThemeMeta,
} from './cascade-themes';

export { CASCADE_THEMES, findCascadeTheme, type CascadeThemeMeta };

export function themesFor(gameId: GameId) {
  if (gameId === 'critical_v1') return CRITICAL_THEMES;
  if (gameId === 'sea_battle_v1') return SEA_BATTLE_THEMES;
  if (gameId === 'tic_tac_toe_v1') return TIC_TAC_TOE_THEMES;
  if (gameId === 'cascade_v1') return CASCADE_THEMES;
  return [];
}

export function findTicTacToeTheme(id: string | undefined): TicTacToeThemeMeta {
  return TIC_TAC_TOE_THEMES.find((t) => t.id === id) ?? TIC_TAC_TOE_THEMES[0];
}

export function findCriticalTheme(id: string | undefined): CriticalTheme {
  return CRITICAL_THEMES.find((t) => t.id === id) ?? CRITICAL_THEMES[0];
}

export function findSeaBattleTheme(id: string | undefined): SeaBattleThemeMeta {
  return SEA_BATTLE_THEMES.find((t) => t.id === id) ?? SEA_BATTLE_THEMES[0];
}

// Expansion packs surfaced in the redesign. `core` is always selected.
// Other IDs map to ExpansionId in features/games/ui/create/constants.ts.
export interface ExpansionPack {
  id: string;
  name: string;
  desc: string;
  count: number;
  locked?: boolean;
}

export const EXPANSION_PACK_LIST: ExpansionPack[] = [
  {
    id: 'core',
    name: 'Core',
    desc: 'The base 31-card deck.',
    count: 31,
    locked: true,
  },
  {
    id: 'attack',
    name: 'Attack Pack',
    desc: 'Targeted strikes, mega evade, and invert chaos.',
    count: 13,
  },
  {
    id: 'future',
    name: 'Future Pack',
    desc: 'See, alter, and reveal the top of the deck.',
    count: 25,
  },
  {
    id: 'theft',
    name: 'Theft Pack',
    desc: 'Wildcards, marks, and steal-draw mayhem.',
    count: 12,
  },
  {
    id: 'chaos',
    name: 'Chaos Pack',
    desc: 'Critical implosions, fission, and blackouts.',
    count: 7,
  },
  {
    id: 'deity',
    name: 'Deity Pack',
    desc: 'Omniscience, miracles, smites, and rapture.',
    count: 9,
  },
];
