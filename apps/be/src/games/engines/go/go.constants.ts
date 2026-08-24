/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  MIN_PLAYERS,
  MAX_PLAYERS,
  BOARD_SIZES,
  DEFAULT_BOARD_SIZE,
  KOMI,
  GAME_PHASE,
  ACTION,
  STAR_POINTS,
  DEFAULT_OPTIONS,
} from '@arcadeum/games-core/games/go/go.constants';
export type {
  GoOptions,
  BoardSize,
  GamePhase,
  ActionType,
  StoneColor,
  Cell,
} from '@arcadeum/games-core/games/go/go.constants';
