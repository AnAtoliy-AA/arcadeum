import { FILES, type BoardPosition, type ChessClientState } from '../types';

export function findKingPosition(
  snapshot: ChessClientState,
): BoardPosition | null {
  for (let row = 0; row < 8; row++)
    for (let col = 0; col < 8; col++) {
      const p = snapshot.board[row]?.[col];
      if (p?.type === 'king' && p.color === snapshot.currentTurnColor)
        return {
          file: FILES[col],
          rank: (8 - row) as import('../types').Rank,
        };
    }
  return null;
}
