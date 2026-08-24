/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  createEmptyBoard,
  shuffleInPlace,
  opponentOf,
  isOnBoard,
  groupAt,
  applyMove,
  probePlacement,
  checkMoveLegality,
  isLegalMove,
  getLegalMoves,
  isTrueEye,
  scoreBoard,
} from '@arcadeum/games-core/games/go/go.utils';
export type {
  Group,
  MoveOutcome,
  PlacementProbe,
  LegalMoveCheck,
  Board,
} from '@arcadeum/games-core/games/go/go.utils';
export { secureRandomInt } from '@arcadeum/games-core/games/go/go.utils';
