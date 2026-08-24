/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  createEmptyBoard,
  expandBoard,
  centeredToIndex,
  indexToCentered,
  findWinningLine,
  isBoardFull,
  nextTurnIndex,
} from '@arcadeum/games-core/games/tic-tac-toe/tic-tac-toe.utils';
export type { ExpandResult } from '@arcadeum/games-core/games/tic-tac-toe/tic-tac-toe.utils';
