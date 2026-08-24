/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  MIN_PLAYERS,
  MAX_PLAYERS,
  TOTAL_POINTS,
  RULE_VARIANTS,
  CHECKERS_PER_VARIANT,
  GAME_PHASE,
  ACTION,
  VARIANTS,
  DEFAULT_OPTIONS,
} from '@arcadeum/games-core/games/backgammon/backgammon.constants';
export type {
  BackgammonOptions,
  RuleVariant,
  GamePhase,
  ActionType,
  PlayerColor,
  Variant,
} from '@arcadeum/games-core/games/backgammon/backgammon.constants';
