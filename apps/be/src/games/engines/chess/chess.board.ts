/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  parseFen,
  boardToFen,
  posToBoardCoords,
  boardCoordsToPos,
  isOnBoard,
  oppositeColor,
  findKing,
  getPiece,
  setPiece,
  generateChess960BackRank,
  isThreefoldRepetition,
  isInsufficientMaterial,
} from '@arcadeum/games-core/games/chess/chess.board';
