export interface GameCatalogRule {
  ruleId: string;
  label: string;
  description?: string;
}

export type GameStartMode = 'immediate' | 'placement';

export interface GameCatalogEntry {
  gameId: string;
  variants: ReadonlyArray<string>;
  rules: ReadonlyArray<GameCatalogRule>;
  startMode: GameStartMode;
}

export const GAME_CATALOG: ReadonlyArray<GameCatalogEntry> = [
  {
    gameId: 'critical_v1',
    startMode: 'immediate',
    variants: [
      'cyberpunk',
      'underwater',
      'crime',
      'horror',
      'adventure',
      'high-altitude-hike',
      'galaxy',
      'fantasy',
      'western',
      'egypt',
      'steampunk',
      'zen',
      'random',
    ],
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
    variants: [
      'classic',
      'modern',
      'pixel',
      'cartoon',
      'cyber',
      'vintage',
      'nebula',
      'forest',
      'sunset',
      'monochrome',
      'speed',
      'battle_royale',
      'team_2v2',
    ],
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
    variants: [],
    rules: [],
  },
  {
    gameId: 'glimworm_v1',
    startMode: 'immediate',
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
    variants: ['classic', 'neon', 'paper', 'pixel', 'chalkboard', 'retro'],
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
    variants: [
      'cosmic',
      'arcane',
      'cyberpunk',
      'elemental',
      'classic',
      'neon',
      'tropical',
      'steampunk',
      'pure',
      'speed',
    ],
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
    variants: ['classic', 'neon', 'wood', 'marble', 'neon_glow'],
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
    variants: ['neon', 'village', 'space', 'nature'],
    rules: [
      {
        ruleId: 'idle',
        label: 'Idle timer autoplay',
        description:
          'Automatically roll the dice if the player does not act within the timer.',
      },
      {
        ruleId: 'spectators',
        label: 'Allow spectators',
        description:
          'Other users can watch the match in real time without joining.',
      },
      {
        ruleId: 'abilities',
        label: 'Cat abilities',
        description:
          'Each cat has unique abilities that can be used during the race.',
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

export function hasVariant(gameId: string, variantId: string): boolean {
  return getCatalogEntry(gameId)?.variants.includes(variantId) ?? false;
}
