/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  MIN_PLAYERS,
  MAX_PLAYERS,
  STARTING_HAND_SIZE,
  COLORS,
  ACTIVE_COLORS,
  CARD_KINDS,
  MODES,
  SPEED_TURN_BUDGET_MS,
  GAME_PHASE,
  PENDING,
  DEFAULT_OPTIONS,
  LAST_CARD_PENALTY,
  DIRECTION,
} from '@arcadeum/games-core/games/cascade/cascade.constants';
export type {
  CardColor,
  ActiveColor,
  CardKind,
  Mode,
  GamePhase,
  PendingAction,
  Direction,
} from '@arcadeum/games-core/games/cascade/cascade.constants';
