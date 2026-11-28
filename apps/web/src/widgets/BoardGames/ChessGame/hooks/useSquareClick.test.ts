import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSquareClick } from './useSquareClick';
import type { Board, BoardPosition, ChessClientState } from '../types';

function setup(selected: BoardPosition | null, legal: BoardPosition[]) {
  const board: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
  board[1][6] = { type: 'pawn', color: 'white' }; // g7
  board[0][7] = { type: 'rook', color: 'black' }; // h8
  const snapshot = {
    board,
    legalMovesForCurrentPlayer: [
      {
        from: { file: 'g', rank: 7 },
        to: { file: 'h', rank: 8 },
        promotion: 'queen',
      },
    ],
  } as unknown as ChessClientState;
  const args = {
    displaySnapshot: snapshot,
    myColor: 'white' as const,
    selectedSquare: selected,
    legalMoves: legal,
    isGameOver: false,
    movePiece: vi.fn(),
    applyOptimisticMove: vi.fn(),
    playSound: vi.fn(),
    confirmMoves: false,
    pendingMove: null,
    setPendingMove: vi.fn(),
    setSelectedSquare: vi.fn(),
    setPendingPromotion: vi.fn(),
  };
  const { result } = renderHook(() => useSquareClick(args));
  return { click: result.current, args };
}

describe('useSquareClick', () => {
  it('opens the promotion picker for a capture-promotion', () => {
    const { click, args } = setup({ file: 'g', rank: 7 }, [
      { file: 'h', rank: 8 },
    ]);
    click('h', 8);
    expect(args.setPendingPromotion).toHaveBeenCalledWith({
      from: { file: 'g', rank: 7 },
      to: { file: 'h', rank: 8 },
    });
    expect(args.movePiece).not.toHaveBeenCalled();
    expect(args.playSound).not.toHaveBeenCalled();
  });

  it('deselects when the selected piece is tapped again', () => {
    const { click, args } = setup({ file: 'g', rank: 7 }, []);
    click('g', 7);
    expect(args.setSelectedSquare).toHaveBeenCalledWith(null);
  });

  it('selects an own piece when nothing is selected', () => {
    const { click, args } = setup(null, []);
    click('g', 7);
    expect(args.setSelectedSquare).toHaveBeenCalledWith({
      file: 'g',
      rank: 7,
    });
  });
});
