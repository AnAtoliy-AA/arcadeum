/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  BOARD_SIZE,
  MIN_PLAYERS,
  MAX_PLAYERS,
  VARIANTS,
  RULE_VARIANTS,
  RULE_VARIANT_CONFIGS,
  GAME_PHASE,
  PLAYER_COLORS,
  DEFAULT_OPTIONS,
  INITIAL_PIECES_PER_PLAYER,
} from '@arcadeum/games-core/games/checkers/checkers.constants';
export type {
  RuleVariantConfig,
  Variant,
  RuleVariant,
  GamePhase,
  PlayerColor,
} from '@arcadeum/games-core/games/checkers/checkers.constants';
