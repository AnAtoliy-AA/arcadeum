/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  assignSeats,
  absoluteCell,
  isProtectedFor,
  tokensByPlayer,
  countFinished,
  capturableTokensOnCell,
  getAllLegalMoves,
  computeMoveOutcome,
  tokensPerVariant,
} from '@arcadeum/games-core/games/pachisi/pachisi.utils';
export type { MoveOutcome } from '@arcadeum/games-core/games/pachisi/pachisi.utils';
