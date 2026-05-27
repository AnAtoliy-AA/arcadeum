export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 10;

export const STARTING_HAND_SIZE = 7;

export const COLORS = ['R', 'Y', 'G', 'B'] as const;
export type CardColor = (typeof COLORS)[number];

export const ACTIVE_COLORS = ['R', 'Y', 'G', 'B'] as const;
export type ActiveColor = (typeof ACTIVE_COLORS)[number];

export const CARD_KINDS = [
  'NUMBER',
  'SKIP',
  'REVERSE',
  'DRAW_TWO',
  'WILD',
  'WILD_DRAW_FOUR',
] as const;
export type CardKind = (typeof CARD_KINDS)[number];

export const VARIANTS = ['cosmic', 'arcane', 'cyberpunk', 'elemental'] as const;
export type Variant = (typeof VARIANTS)[number];

/**
 * Gameplay modes — distinct from the visual `variant`. The visual theme is
 * pure presentation; the mode changes engine behavior.
 *
 * - classic: full ruleset (stacking enabled, no clock).
 * - pure:    no stacking — Draw-Two / Wild +4 immediately resolve.
 * - speed:   stacking enabled + per-turn clock; the bot/service auto-draws
 *            for an idle player whose clock expires.
 */
export const MODES = ['classic', 'pure', 'speed'] as const;
export type Mode = (typeof MODES)[number];

/** Per-turn clock budget in ms for `speed` mode. */
export const SPEED_TURN_BUDGET_MS = 15000;

export const GAME_PHASE = {
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
} as const;
export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export const PENDING = {
  NONE: 'none',
  WILD_COLOR: 'wild_color',
  WILD_DRAW_FOUR_COLOR: 'wild_draw_four_color',
} as const;
export type PendingAction = (typeof PENDING)[keyof typeof PENDING];

export const DEFAULT_OPTIONS = {
  variant: 'cosmic' as Variant,
  mode: 'classic' as Mode,
  stackingEnabled: true,
};

export const DIRECTION = {
  CLOCKWISE: 1,
  COUNTER_CLOCKWISE: -1,
} as const;
export type Direction = (typeof DIRECTION)[keyof typeof DIRECTION];
