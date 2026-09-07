import type { ChessState, BoardPosition } from '../chess.types';

const CENTER_SQUARES: BoardPosition[] = [
  { file: 'd', rank: 4 },
  { file: 'e', rank: 4 },
  { file: 'd', rank: 5 },
  { file: 'e', rank: 5 },
];

export function isKingOnCenter(state: ChessState): 'white' | 'black' | null {
  for (const pos of CENTER_SQUARES) {
    const row = 8 - pos.rank;
    const col = pos.file.charCodeAt(0) - 97;
    const piece = state.board[row]?.[col];
    if (piece?.type === 'king') {
      return piece.color;
    }
  }
  return null;
}

export function checkKingOfTheHillWin(
  state: ChessState,
): 'white' | 'black' | null {
  const kingColor = isKingOnCenter(state);
  return kingColor;
}
