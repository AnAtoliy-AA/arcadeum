import type { ChessState, ChessPiece } from '../chess.types';
import type { PieceType } from '../chess.constants';

export interface CrazyhouseState extends ChessState {
  capturedPieces: {
    white: PieceType[];
    black: PieceType[];
  };
}

export function createCrazyhouseState(base: ChessState): CrazyhouseState {
  return {
    ...base,
    capturedPieces: { white: [], black: [] },
  };
}

export function recordCapture(
  state: CrazyhouseState,
  capturedPiece: ChessPiece,
  capturingColor: 'white' | 'black',
): CrazyhouseState {
  const newCaptured = {
    white: [...state.capturedPieces.white],
    black: [...state.capturedPieces.black],
  };
  newCaptured[capturingColor].push(capturedPiece.type);
  return { ...state, capturedPieces: newCaptured };
}

export function canDrop(
  state: CrazyhouseState,
  color: 'white' | 'black',
  pieceType: PieceType,
): boolean {
  if (pieceType === 'king') return false;
  return state.capturedPieces[color].includes(pieceType);
}
