/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  getDefaultShipCount,
  getActiveShips,
  MIN_PLAYERS,
  MAX_PLAYERS,
  MAX_PLAYERS_TEAM_MODE,
  MIN_TEAM_SIZE,
  MIN_TEAMS,
  BOARD_SIZE,
  CELL_STATE,
  SHIPS,
  GAME_PHASE,
  ATTACK_RESULT,
  GAME_MODE_VARIANTS,
  SPEED_TURN_BUDGET_MS,
  SPEED_PLACEMENT_BUDGET_MS,
  BATTLE_ROYALE_SHRINK_INTERVAL_MS,
  BATTLE_ROYALE_MAX_ROUNDS,
  ROW_LABELS,
  COL_LABELS,
} from '@arcadeum/games-core/games/sea-battle/sea-battle.constants';
export type {
  ShipConfig,
  CellState,
  GamePhase,
  AttackResult,
  GameModeVariant,
} from '@arcadeum/games-core/games/sea-battle/sea-battle.constants';
