/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  createEmptyBoard,
  areCellsValid,
  areCellsConnected,
  markSurroundingCellsAsMiss,
  sanitizeSeaBattleState,
  getSeaBattleAvailableActions,
  randomlyPlaceShips,
} from '@arcadeum/games-core/games/sea-battle/sea-battle.utils';
