import { SHARED_VISUAL_THEMES } from './common/shared-themes';

export interface GameCatalogRule {
  ruleId: string;
  label: string;
  description?: string;
}

export type GameStartMode = 'immediate' | 'placement';

export interface GameCatalogEntry {
  gameId: string;
  themes: ReadonlyArray<string>;
  modes: ReadonlyArray<string>;
  variants: ReadonlyArray<string>;
  rules: ReadonlyArray<GameCatalogRule>;
  startMode: GameStartMode;
}

export const GAME_CATALOG: ReadonlyArray<GameCatalogEntry> = [
  {
    gameId: 'critical_v1',
    startMode: 'immediate',
    themes: [...SHARED_VISUAL_THEMES],
    modes: [],
    variants: ['standard'],
    rules: [
      {
        ruleId: 'combos',
        label: 'Action card combos',
        description:
          'Players can combine cards for special actions and bonus effects.',
      },
      {
        ruleId: 'idle',
        label: 'Idle timer autoplay',
        description:
          'Automatically play a random card if the player does not act within the timer.',
      },
      {
        ruleId: 'spectators',
        label: 'Allow spectators',
        description:
          'Other users can watch the match in real time without joining.',
      },
    ],
  },
  {
    gameId: 'sea_battle_v1',
    startMode: 'placement',
    themes: [...SHARED_VISUAL_THEMES],
    modes: ['classic', 'speed', 'battle_royale', 'team_2v2'],
    variants: ['classic', 'speed', 'battle_royale', 'team_2v2'],
    rules: [
      {
        ruleId: 'idle',
        label: 'Idle timer autoplay',
        description:
          'Automatically fire at a random cell if the player does not act within the timer.',
      },
      {
        ruleId: 'teams',
        label: 'Team mode',
        description:
          'Players are divided into teams that share a board and take turns together.',
      },
      {
        ruleId: 'spectators',
        label: 'Allow spectators',
        description:
          'Other users can watch the match in real time without joining.',
      },
      {
        ruleId: 'sonar',
        label: 'Sonar scan',
        description:
          "Each player can reveal a 3×3 area on the opponent's board once per game to detect ships.",
      },
      {
        ruleId: 'radar',
        label: 'Radar sweep',
        description:
          "Each player can scan an entire row or column on the opponent's board once per game.",
      },
      {
        ruleId: 'gridSize',
        label: 'Board size selection',
        description:
          'Allow players to choose the grid size (10×10, 15×15, or 20×20) before the match starts.',
      },
      {
        ruleId: 'botWeapons',
        label: 'Bot special weapons',
        description: 'Allow bots to use sonar and radar during their turn.',
      },
    ],
  },
  {
    gameId: 'texas_holdem_v1',
    startMode: 'immediate',
    themes: [...SHARED_VISUAL_THEMES],
    modes: ['standard'],
    variants: ['standard'],
    rules: [],
  },
  {
    gameId: 'glimworm_v1',
    startMode: 'immediate',
    themes: [...SHARED_VISUAL_THEMES],
    modes: ['battle_royale', 'time_attack', 'lives_heats'],
    variants: ['battle_royale', 'time_attack', 'lives_heats'],
    rules: [
      {
        ruleId: 'idle',
        label: 'Idle timer autoplay',
        description:
          'Automatically shoot in a random direction if the player does not act within the timer.',
      },
      {
        ruleId: 'spectators',
        label: 'Allow spectators',
        description:
          'Other users can watch the match in real time without joining.',
      },
    ],
  },
  {
    gameId: 'tic_tac_toe_v1',
    startMode: 'immediate',
    themes: [...SHARED_VISUAL_THEMES],
    modes: ['classic', '3x3', '5x5', '7x7', '9x9', 'infinity'],
    variants: ['classic', '3x3', '5x5', '7x7', '9x9', 'infinity'],
    rules: [
      {
        ruleId: 'teams',
        label: 'Team mode',
        description:
          'Players are divided into teams and take turns on a shared board.',
      },
      {
        ruleId: 'spectators',
        label: 'Allow spectators',
        description:
          'Other users can watch the match in real time without joining.',
      },
    ],
  },
  {
    gameId: 'cascade_v1',
    startMode: 'immediate',
    themes: [...SHARED_VISUAL_THEMES],
    modes: ['classic', 'pure', 'speed'],
    variants: ['classic', 'pure', 'speed'],
    rules: [
      {
        ruleId: 'idle',
        label: 'Idle timer autoplay',
        description:
          'Automatically drop a piece if the player does not act within the timer.',
      },
      {
        ruleId: 'spectators',
        label: 'Allow spectators',
        description:
          'Other users can watch the match in real time without joining.',
      },
    ],
  },
  {
    gameId: 'chess_v1',
    startMode: 'immediate',
    themes: [...SHARED_VISUAL_THEMES],
    modes: ['standard', 'chess960'],
    variants: ['standard', 'chess960'],
    rules: [
      {
        ruleId: 'idle',
        label: 'Idle timer autoplay',
        description:
          'Automatically make a move if the player does not act within the timer.',
      },
      {
        ruleId: 'spectators',
        label: 'Allow spectators',
        description:
          'Other users can watch the match in real time without joining.',
      },
    ],
  },
  {
    gameId: 'checkers_v1',
    startMode: 'immediate',
    themes: [...SHARED_VISUAL_THEMES],
    modes: ['american', 'international', 'russian'],
    variants: ['american', 'international', 'russian'],
    rules: [
      {
        ruleId: 'idle',
        label: 'Idle timer autoplay',
        description:
          'Automatically make a move if the player does not act within the timer.',
      },
      {
        ruleId: 'spectators',
        label: 'Allow spectators',
        description:
          'Other users can watch the match in real time without joining.',
      },
      {
        ruleId: 'forcedCaptures',
        label: 'Forced captures',
        description: 'Players must capture when a capture is available.',
      },
    ],
  },
  {
    gameId: 'cat_dash_v1',
    startMode: 'immediate',
    themes: [...SHARED_VISUAL_THEMES],
    modes: ['linear', 'circular', 'multiple'],
    variants: ['linear', 'circular', 'multiple'],
    rules: [
      {
        ruleId: 'idle',
        label: 'Idle timer autoplay',
        description:
          'Automatically roll the dice if the player does not act within the timer.',
      },
      {
        ruleId: 'abilities',
        label: 'Cat abilities',
        description:
          'Each cat has unique abilities that can be used during the race.',
      },
      {
        ruleId: 'spectators',
        label: 'Allow spectators',
        description:
          'Other users can watch the match in real time without joining.',
      },
    ],
  },
  {
    gameId: 'backgammon_v1',
    startMode: 'immediate',
    themes: [...SHARED_VISUAL_THEMES],
    modes: ['standard', 'long', 'hyper', 'tavla', 'nackgammon', 'gulbara'],
    variants: ['standard', 'long', 'hyper', 'tavla', 'nackgammon', 'gulbara'],
    rules: [
      {
        ruleId: 'idle',
        label: 'Idle timer autoplay',
        description:
          'Automatically roll or move a checker if the player does not act within the timer.',
      },
      {
        ruleId: 'spectators',
        label: 'Allow spectators',
        description:
          'Other users can watch the match in real time without joining.',
      },
    ],
  },
  {
    gameId: 'hearts_v1',
    startMode: 'immediate',
    themes: [...SHARED_VISUAL_THEMES],
    modes: [],
    variants: [...SHARED_VISUAL_THEMES],
    rules: [
      {
        ruleId: 'passing',
        label: 'Card passing',
        description:
          'Pass 3 cards left, right, across, or hold hands each round before play.',
      },
      {
        ruleId: 'shoot_the_moon',
        label: 'Shoot the moon',
        description:
          'Take all 26 penalty points in a hand to zero your score and add 26 to every opponent.',
      },
      {
        ruleId: 'spectators',
        label: 'Allow spectators',
        description:
          'Other users can watch the match in real time without joining.',
      },
    ],
  },
  {
    gameId: 'spades_v1',
    startMode: 'immediate',
    themes: [...SHARED_VISUAL_THEMES],
    // Partnerships (2v2) are inherent to Spades rules, not a selectable mode.
    modes: [],
    variants: [...SHARED_VISUAL_THEMES],
    rules: [
      {
        ruleId: 'bidding',
        label: 'Bidding',
        description:
          'Bid the number of tricks your partnership will take before each hand begins.',
      },
      {
        ruleId: 'nil_bids',
        label: 'Nil bids',
        description:
          'Bid Nil to risk ±100 points on taking zero tricks — partners cover you.',
      },
      {
        ruleId: 'sandbagging',
        label: 'Sandbagging',
        description:
          'Overtricks become bags; every 10 accumulated bags costs 100 points.',
      },
      {
        ruleId: 'spectators',
        label: 'Allow spectators',
        description:
          'Other users can watch the match in real time without joining.',
      },
    ],
  },
  {
    gameId: 'go_v1',
    startMode: 'immediate',
    themes: [...SHARED_VISUAL_THEMES],
    modes: [],
    variants: [...SHARED_VISUAL_THEMES],
    rules: [
      {
        ruleId: 'captures',
        label: 'Captures',
        description:
          'Groups with no remaining liberties are removed from the board.',
      },
      {
        ruleId: 'ko',
        label: 'Ko rule',
        description:
          'Immediate single-stone recapture that recreates the previous position is forbidden.',
      },
      {
        ruleId: 'area_scoring',
        label: 'Area scoring',
        description:
          'Chinese scoring: stones plus surrounded territory, with komi for white.',
      },
      {
        ruleId: 'spectators',
        label: 'Allow spectators',
        description:
          'Other users can watch the match in real time without joining.',
      },
    ],
  },
  {
    gameId: 'pachisi_v1',
    startMode: 'immediate',
    themes: [...SHARED_VISUAL_THEMES],
    modes: ['standard', 'quick'],
    variants: ['standard', 'quick'],
    rules: [
      {
        ruleId: 'idle',
        label: 'Idle timer autoplay',
        description:
          'Automatically roll the die or move a token if the player does not act within the timer.',
      },
      {
        ruleId: 'spectators',
        label: 'Allow spectators',
        description:
          'Other users can watch the match in real time without joining.',
      },
    ],
  },
];

const CATALOG_INDEX = new Map<string, GameCatalogEntry>(
  GAME_CATALOG.map((g) => [g.gameId, g]),
);

export function getCatalogEntry(gameId: string): GameCatalogEntry | undefined {
  return CATALOG_INDEX.get(gameId);
}

export function hasTheme(gameId: string, themeId: string): boolean {
  return getCatalogEntry(gameId)?.themes.includes(themeId) ?? false;
}

export function hasVariant(gameId: string, variantId: string): boolean {
  return getCatalogEntry(gameId)?.variants.includes(variantId) ?? false;
}

export function hasMode(gameId: string, modeId: string): boolean {
  return getCatalogEntry(gameId)?.modes.includes(modeId) ?? false;
}
