import type { Board, ChessClientState, File, PieceType, Rank } from '../types';
import { FILES } from '../types';

export function calculateOptimisticChessState(
  snapshot: ChessClientState,
  fromFile: File,
  fromRank: Rank,
  toFile: File,
  toRank: Rank,
  promotion?: PieceType,
): ChessClientState | null {
  const fromRow = 8 - fromRank;
  const fromCol = FILES.indexOf(fromFile);
  const toRow = 8 - toRank;
  const toCol = FILES.indexOf(toFile);
  const piece = snapshot.board[fromRow]?.[fromCol];
  if (!piece) return null;

  const newBoard: Board = snapshot.board.map((row) => [...row]);
  newBoard[toRow][toCol] = promotion
    ? { type: promotion, color: piece.color }
    : piece;
  newBoard[fromRow][fromCol] = null;

  const isCastle = piece.type === 'king' && Math.abs(toCol - fromCol) === 2;
  let isCastleFlag = false;
  if (isCastle) {
    isCastleFlag = true;
    if (toCol === 6) {
      let rookCol = -1;
      for (let c = toCol + 1; c < newBoard[toRow].length; c++) {
        if (
          newBoard[toRow][c]?.type === 'rook' &&
          newBoard[toRow][c]?.color === piece.color
        ) {
          rookCol = c;
          break;
        }
      }
      if (rookCol >= 0) {
        newBoard[toRow][5] = newBoard[toRow][rookCol];
        newBoard[toRow][rookCol] = null;
      }
    } else if (toCol === 2) {
      let rookCol = -1;
      for (let c = toCol - 1; c >= 0; c--) {
        if (newBoard[toRow][c]?.type === 'rook') {
          rookCol = c;
          break;
        }
      }
      if (rookCol >= 0) {
        newBoard[toRow][3] = newBoard[toRow][rookCol];
        newBoard[toRow][rookCol] = null;
      }
    }
  }

  return {
    ...snapshot,
    board: newBoard,
    currentTurnColor: snapshot.currentTurnColor === 'white' ? 'black' : 'white',
    moveHistory: [
      ...snapshot.moveHistory,
      {
        from: { file: fromFile, rank: fromRank },
        to: { file: toFile, rank: toRank },
        piece,
        captured: snapshot.board[toRow]?.[toCol] ?? null,
        promotion: promotion ?? null,
        isCastle: isCastleFlag,
        isEnPassant: false,
        notation: '',
      },
    ],
    legalMovesForCurrentPlayer: [],
    isCheck: false,
  };
}
