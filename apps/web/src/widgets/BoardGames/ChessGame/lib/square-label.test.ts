import { describe, it, expect } from 'vitest';
import { buildSquareLabel } from './square-label';

const t = ((key: string, params?: Record<string, string | number>) =>
  params
    ? `${key.split('.').pop()}(${Object.values(params).join('|')})`
    : (key.split('.').pop() ?? key)) as never;

describe('buildSquareLabel', () => {
  it('labels an empty square with its algebraic name', () => {
    expect(buildSquareLabel(t, { file: 'e', rank: 4, piece: null })).toBe('e4');
  });

  it('includes the translated piece and colour', () => {
    expect(
      buildSquareLabel(t, {
        file: 'g',
        rank: 1,
        piece: { type: 'knight', color: 'white' },
      }),
    ).toBe('withPiece(g1|white|knight)');
  });

  it('appends every active state in a stable order', () => {
    expect(
      buildSquareLabel(t, {
        file: 'e',
        rank: 1,
        piece: { type: 'king', color: 'white' },
        selected: true,
        legalTarget: true,
        kingCheck: true,
        lastMoved: true,
        hintMoved: true,
      }),
    ).toBe(
      'withPiece(e1|white|king), selected, legalMove, check, lastMove, suggested',
    );
  });
});
