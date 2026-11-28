import { describe, it, expect } from 'vitest';
import { isPromotionMove } from './promotion';
import type { Board, LegalMove } from '../types';

const emptyBoard = (): Board =>
  Array.from({ length: 8 }, () => Array(8).fill(null));

function boardWith(
  pieces: Array<[string, number, 'white' | 'black', 'pawn' | 'rook']>,
): Board {
  const b = emptyBoard();
  for (const [file, rank, color, type] of pieces) {
    b[8 - rank]![file.charCodeAt(0) - 97] = { type, color };
  }
  return b;
}

describe('isPromotionMove', () => {
  it('detects a capture-promotion from the legal move list', () => {
    const legal: LegalMove[] = [
      {
        from: { file: 'g', rank: 7 },
        to: { file: 'h', rank: 8 },
        promotion: 'queen',
      },
    ];
    const board = boardWith([
      ['g', 7, 'white', 'pawn'],
      ['h', 8, 'black', 'rook'],
    ]);
    expect(
      isPromotionMove(
        { board, legalMovesForCurrentPlayer: legal },
        { file: 'g', rank: 7 },
        { file: 'h', rank: 8 },
      ),
    ).toBe(true);
  });

  it('is false for a legal non-promotion move', () => {
    const legal: LegalMove[] = [
      {
        from: { file: 'e', rank: 2 },
        to: { file: 'e', rank: 4 },
        promotion: null,
      },
    ];
    expect(
      isPromotionMove(
        {
          board: boardWith([['e', 2, 'white', 'pawn']]),
          legalMovesForCurrentPlayer: legal,
        },
        { file: 'e', rank: 2 },
        { file: 'e', rank: 4 },
      ),
    ).toBe(false);
  });

  it('falls back to the last-rank rule without a legal list', () => {
    const board = boardWith([
      ['b', 2, 'black', 'pawn'],
      ['a', 1, 'white', 'rook'],
    ]);
    expect(
      isPromotionMove(
        { board, legalMovesForCurrentPlayer: [] },
        { file: 'b', rank: 2 },
        { file: 'a', rank: 1 },
      ),
    ).toBe(true);
    expect(
      isPromotionMove(
        { board, legalMovesForCurrentPlayer: [] },
        { file: 'a', rank: 1 },
        { file: 'a', rank: 8 },
      ),
    ).toBe(false);
  });
});
