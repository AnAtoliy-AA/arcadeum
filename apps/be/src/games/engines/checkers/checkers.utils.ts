/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  createInitialBoard,
  isPlayerPiece,
  getOpponentId,
  getPlayerColor,
  getMoveDirections,
  getKingDirections,
  getDirectionsForPiece,
  getCaptureDirectionsForPiece,
  inBounds,
  cloneBoard,
  countPieces,
  getBoardStats,
  hasCapturesFrom,
  findSimpleMoves,
  findCaptures,
  findAllCapturesForPlayer,
  findAllSimpleMovesForPlayer,
  getAvailableMovesForPlayer,
  applyMove,
  hasAnyMoves,
} from '@arcadeum/games-core/games/checkers/checkers.utils';
export type { BoardStats } from '@arcadeum/games-core/games/checkers/checkers.utils';
