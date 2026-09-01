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
  MODES,
  TOKENS_BY_MODE,
  GAME_PHASE,
  ACTION,
  DEFAULT_OPTIONS,
} from '@arcadeum/games-core/games/pachisi/pachisi.constants';
export type {
  PachisiOptions,
  SeatColor,
  Mode,
  GamePhase,
  ActionType,
} from '@arcadeum/games-core/games/pachisi/pachisi.constants';
