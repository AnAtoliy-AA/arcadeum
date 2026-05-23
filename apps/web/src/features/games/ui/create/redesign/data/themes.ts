export type GameId = 'critical_v1' | 'sea_battle_v1' | 'glimworm_v1';

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
};

export const VISIBLE_GAMES: GameId[] = [
  'critical_v1',
  'sea_battle_v1',
  'glimworm_v1',
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
    color: '#7dd3fc',
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
    name: 'Cyberpunk',
    desc: 'Neon pink salvos over carbon mesh.',
    color: '#06b6d4',
    palette: {
      bg: '#06011b',
      cell: '#2d0a4f',
      ship: '#06b6d4',
      hit: '#ec4899',
      miss: '#a78bfa',
    },
  },
  {
    id: 'nebula',
    name: 'Nebula',
    desc: 'Star-flecked grid drifting through purple cloud.',
    color: '#a78bfa',
    palette: {
      bg: '#06011b',
      cell: '#1e1b4b',
      ship: '#a78bfa',
      hit: '#fb7185',
      miss: '#c4b5fd',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    desc: 'Topographic green-on-moss for the patient admiral.',
    color: '#34d399',
    palette: {
      bg: '#062a23',
      cell: '#0f3d33',
      ship: '#34d399',
      hit: '#fb923c',
      miss: '#6ee7b7',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    desc: 'Warm coral grid over deepening dusk.',
    color: '#fb923c',
    palette: {
      bg: '#2a1106',
      cell: '#4a1f0e',
      ship: '#fb923c',
      hit: '#fbbf24',
      miss: '#fca5a5',
    },
  },
  {
    id: 'monochrome',
    name: 'Mono',
    desc: 'Pure black ink on bone — competition-grade.',
    color: '#e5e7eb',
    palette: {
      bg: '#0a0a0a',
      cell: '#1c1c1c',
      ship: '#e5e7eb',
      hit: '#ef4444',
      miss: '#737373',
    },
  },
];

export function themesFor(gameId: GameId) {
  if (gameId === 'critical_v1') return CRITICAL_THEMES;
  if (gameId === 'sea_battle_v1') return SEA_BATTLE_THEMES;
  return [];
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
