import { TranslationKey } from '@/shared/lib/useTranslation';

export interface FeaturedGame {
  id: string;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  /**
   * Per-game accent hex used to tint the V2 cover gradient, corner pill,
   * symbol, and hover border. Falls back to the theme accent if omitted.
   */
  accentColor?: string;
  /** Genre label rendered in the cover corner pill (e.g. "Card", "Board"). */
  genre: string;
  /** Pace label rendered alongside the genre (e.g. "Strategy", "Real-time"). */
  pace: string;
  /** Player range shown in the meta row (e.g. "3–5"). */
  players: string;
  /** Match duration shown in the meta row (e.g. "15 min"). */
  duration: string;
  /**
   * Optional live "playing now" count. Hidden when null/undefined — backend
   * is expected to populate this later; we currently render a static record.
   */
  playingNow?: number | null;
  isPlayable: boolean;
  /** Marks the card with a "DEMO" badge — early preview, not feature-complete. */
  isDemo?: boolean;
  /**
   * URL of the game's SEO landing page (e.g. /games/sea-battle).
   * When set, the home card's title and "Play Now" button deep-link to
   * the landing instead of going straight to room creation.
   */
  landingHref?: string;
  type: 'card' | 'board';
  rulesPrefix: string;
  rulesKeys: string[];
  variableKeys?: Record<string, TranslationKey>;
  variants: Array<{ id: string; nameKey: TranslationKey; disabled?: boolean }>;
}

import { CARD_VARIANTS } from '@/features/games/ui/create/constants';
import { SEA_BATTLE_VARIANTS } from '@/widgets/SeaBattleGame/lib/constants';
import { GLIMWORM_VARIANTS } from '@/features/games/lib/glimwormVariants';
import { TIC_TAC_TOE_VARIANTS } from '@/widgets/TicTacToeGame/lib/constants';

export const featuredGames: FeaturedGame[] = [
  {
    id: 'critical_v1',
    nameKey: 'games.critical_v1.name' as TranslationKey,
    descriptionKey: 'games.critical_v1.description' as TranslationKey,
    accentColor: '#f97316',
    genre: 'Card',
    pace: 'Strategy',
    players: '3–5',
    duration: '15 min',
    playingNow: null,
    isPlayable: true,
    type: 'card',
    rulesPrefix: 'games.critical_v1.rules',
    rulesKeys: ['objective', 'gameplay', 'combos', 'setup'],
    variableKeys: {
      criticalEvent: 'games.table.cards.criticalEvent' as TranslationKey,
      neutralizer: 'games.table.cards.neutralizer' as TranslationKey,
    },
    variants: CARD_VARIANTS.map((v) => ({
      id: v.id,
      nameKey: v.name as TranslationKey,
      disabled: v.disabled,
    })),
  },
  {
    id: 'sea_battle_v1',
    nameKey: 'games.sea_battle_v1.name' as TranslationKey,
    descriptionKey: 'games.sea_battle_v1.description' as TranslationKey,
    accentColor: '#38bdf8',
    genre: 'Board',
    pace: 'Strategy',
    players: '2–6',
    duration: '10 min',
    playingNow: null,
    isPlayable: true,
    landingHref: '/games/sea-battle',
    type: 'board',
    rulesPrefix: 'games.sea_battle_v1.rules',
    rulesKeys: ['objective', 'gameplay', 'placement', 'battle'],
    variants: SEA_BATTLE_VARIANTS.map((v) => ({
      id: v.id,
      nameKey: v.name as TranslationKey,
    })),
  },
  {
    id: 'glimworm_v1',
    nameKey: 'games.glimworm_v1.name' as TranslationKey,
    descriptionKey: 'games.glimworm_v1.description' as TranslationKey,
    accentColor: '#a78bfa',
    genre: 'Arcade',
    pace: 'Real-time',
    players: '2–10',
    duration: '90 sec',
    playingNow: null,
    isPlayable: true,
    isDemo: true,
    type: 'board',
    rulesPrefix: 'games.glimworm_v1.rules',
    rulesKeys: ['objective', 'gameplay', 'survive', 'powerups'],
    variants: GLIMWORM_VARIANTS.map((v) => ({
      id: v.id,
      nameKey: v.name as TranslationKey,
      disabled: v.disabled,
    })),
  },
  {
    id: 'tic_tac_toe_v1',
    nameKey: 'games.tic_tac_toe_v1.name' as TranslationKey,
    descriptionKey: 'games.tic_tac_toe_v1.description' as TranslationKey,
    accentColor: '#22d3ee',
    genre: 'Board',
    pace: 'Strategy',
    players: '2–4',
    duration: '5 min',
    playingNow: null,
    isPlayable: true,
    landingHref: '/games/tic-tac-toe',
    type: 'board',
    rulesPrefix: 'games.tic_tac_toe_v1.rules',
    rulesKeys: ['objective', 'steps', 'winLengths'],
    variants: TIC_TAC_TOE_VARIANTS.map((v) => ({
      id: v.id,
      nameKey: v.name as TranslationKey,
    })),
  },
];
