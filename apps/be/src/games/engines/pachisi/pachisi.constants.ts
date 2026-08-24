/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  MIN_PLAYERS,
  MAX_PLAYERS,
  TRACK_LENGTH,
  MAIN_PATH_STEPS,
  HOME_LANE_STEPS,
  FINISH_PROGRESS,
  YARD_PROGRESS,
  SEAT_START_OFFSETS,
  SEAT_COLORS,
  STAR_CELLS,
  RULE_VARIANTS,
  TOKENS_BY_RULE_VARIANT,
  GAME_PHASE,
  ACTION,
  VARIANTS,
  DEFAULT_OPTIONS,
} from '@arcadeum/games-core/games/pachisi/pachisi.constants';
export type {
  PachisiOptions,
  SeatColor,
  RuleVariant,
  GamePhase,
  ActionType,
  Variant,
} from '@arcadeum/games-core/games/pachisi/pachisi.constants';
