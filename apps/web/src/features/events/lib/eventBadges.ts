export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface EventPrizeBadgeDef {
  id: string;
  name: string;
  description: string;
  gameType: string;
  rarity: BadgeRarity;
  gradient: string;
  glowColor: string;
  iconType:
    | 'crown'
    | 'anchor'
    | 'dice'
    | 'crest'
    | 'stone'
    | 'spade'
    | 'heart'
    | 'lightning'
    | 'fang'
    | 'gem'
    | 'bomb'
    | 'ace'
    | 'grid'
    | 'medallion';
}

export const EVENT_PRIZE_BADGES: Record<string, EventPrizeBadgeDef> = {
  admiral_ribbon: {
    id: 'admiral_ribbon',
    name: "Admiral's Ribbon",
    description:
      'Awarded to supreme naval tacticians in the Sea Battle Armada Clash.',
    gameType: 'sea-battle',
    rarity: 'epic',
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    iconType: 'anchor',
  },
  champion_crown: {
    id: 'champion_crown',
    name: "Grandmaster's Crown",
    description:
      'Awarded to undisputed champions of the Friday Night Blitz Chess tournament.',
    gameType: 'chess',
    rarity: 'legendary',
    gradient: 'from-amber-300 via-yellow-400 to-yellow-600',
    glowColor: 'rgba(234, 179, 8, 0.45)',
    iconType: 'crown',
  },
  golden_dice: {
    id: 'golden_dice',
    name: 'Golden Doubling Dice',
    description:
      'Awarded to master strategists of the Sunday Backgammon Derby.',
    gameType: 'backgammon',
    rarity: 'epic',
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    iconType: 'dice',
  },
  king_crest: {
    id: 'king_crest',
    name: 'Checker King Crest',
    description: 'Awarded to tactical kings of the Checkers Championship.',
    gameType: 'checkers',
    rarity: 'rare',
    gradient: 'from-red-500 via-rose-500 to-red-700',
    glowColor: 'rgba(239, 68, 68, 0.35)',
    iconType: 'crest',
  },
  zenith_stone: {
    id: 'zenith_stone',
    name: 'Zenith Stone',
    description:
      'Awarded to territorial masters of the Go Zenith Invitational.',
    gameType: 'go',
    rarity: 'legendary',
    gradient: 'from-slate-200 via-cyan-400 to-slate-800',
    glowColor: 'rgba(34, 211, 238, 0.45)',
    iconType: 'stone',
  },
  spade_overlord: {
    id: 'spade_overlord',
    name: 'Spade Overlord Badge',
    description: 'Awarded to high-stakes nil callers in the Spades Showdown.',
    gameType: 'spades',
    rarity: 'epic',
    gradient: 'from-purple-500 via-indigo-600 to-slate-900',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    iconType: 'spade',
  },
  queen_slayer: {
    id: 'queen_slayer',
    name: 'Queen Slayer Ribbon',
    description:
      'Awarded to players who successfully shoot the moon in Hearts.',
    gameType: 'hearts',
    rarity: 'epic',
    gradient: 'from-rose-500 via-pink-600 to-red-600',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    iconType: 'heart',
  },
  speed_whiskers: {
    id: 'speed_whiskers',
    name: 'Speed Whiskers',
    description: 'Awarded to fastest sprint runners in Cat Dash Circuit.',
    gameType: 'cat-dash',
    rarity: 'rare',
    gradient: 'from-cyan-400 via-sky-500 to-blue-600',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    iconType: 'lightning',
  },
  luminescent_fang: {
    id: 'luminescent_fang',
    name: 'Luminescent Fang',
    description: 'Awarded to the longest-surviving arena serpent in Glimworm.',
    gameType: 'glimworm',
    rarity: 'epic',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    iconType: 'fang',
  },
  cascade_gem: {
    id: 'cascade_gem',
    name: 'Cascade Prism',
    description: 'Awarded to highest chain-combo masters in Cascade.',
    gameType: 'cascade',
    rarity: 'rare',
    gradient: 'from-fuchsia-400 via-purple-500 to-indigo-600',
    glowColor: 'rgba(192, 132, 252, 0.35)',
    iconType: 'gem',
  },
  bomb_squad: {
    id: 'bomb_squad',
    name: 'Bomb Squad Insignia',
    description:
      'Awarded to flaw-free sweeper specialists in Minesweeper Sprint.',
    gameType: 'minesweeper',
    rarity: 'rare',
    gradient: 'from-amber-400 via-emerald-500 to-teal-700',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    iconType: 'bomb',
  },
  patience_ace: {
    id: 'patience_ace',
    name: 'Patience Ace Medallion',
    description: 'Awarded to top speed run clearers in Solitaire Masters.',
    gameType: 'solitaire',
    rarity: 'rare',
    gradient: 'from-emerald-500 via-teal-600 to-slate-800',
    glowColor: 'rgba(20, 184, 166, 0.35)',
    iconType: 'ace',
  },
  grid_solver: {
    id: 'grid_solver',
    name: 'Master Solver Crest',
    description:
      'Awarded to precision puzzle solvers in the Sudoku Championship.',
    gameType: 'sudoku',
    rarity: 'rare',
    gradient: 'from-blue-400 via-indigo-500 to-violet-700',
    glowColor: 'rgba(99, 102, 241, 0.35)',
    iconType: 'grid',
  },
  number_cruncher: {
    id: 'number_cruncher',
    name: '2048 Medallion',
    description: 'Awarded to board clearers reaching the legendary 2048 tile.',
    gameType: '2048',
    rarity: 'rare',
    gradient: 'from-amber-400 via-yellow-500 to-amber-700',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    iconType: 'medallion',
  },
};

export function getEventPrizeBadge(
  badgeId: string | null | undefined,
): EventPrizeBadgeDef | null {
  if (!badgeId) return null;
  const normalized = badgeId.toLowerCase().trim();
  return EVENT_PRIZE_BADGES[normalized] ?? null;
}

export function getAllEventPrizeBadges(): EventPrizeBadgeDef[] {
  return Object.values(EVENT_PRIZE_BADGES);
}
