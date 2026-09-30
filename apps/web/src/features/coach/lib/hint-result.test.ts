import { describe, it, expect } from 'vitest';
import {
  mapServerHint,
  mapServerCheckersHint,
  mapServerBackgammonHint,
  type ServerHintMove,
} from './hint-result';

const VALID_MOVE: ServerHintMove = {
  from: { file: 'e', rank: 2 },
  to: { file: 'g', rank: 1 },
  piece: { type: 'king', color: 'white' },
  captured: null,
  promotion: null,
  isCastle: true,
};

describe('mapServerHint', () => {
  it('maps a valid server move into the internal ChessHint shape', () => {
    const hint = mapServerHint({
      from: { file: 'e', rank: 2 },
      to: { file: 'e', rank: 4 },
      piece: { type: 'pawn', color: 'white' },
      captured: null,
      promotion: null,
      isCastle: false,
    });

    expect(hint).not.toBeNull();
    expect(hint?.from).toEqual({ file: 'e', rank: 2 });
    expect(hint?.to).toEqual({ file: 'e', rank: 4 });
    expect(hint?.piece).toEqual({ type: 'pawn', color: 'white' });
    expect(hint?.captured).toBeNull();
    expect(hint?.promotion).toBeNull();
    expect(hint?.score).toBe(0);
  });

  it('maps captures and promotions', () => {
    const hint = mapServerHint({
      from: { file: 'e', rank: 7 },
      to: { file: 'd', rank: 8 },
      piece: { type: 'pawn', color: 'white' },
      captured: { type: 'knight', color: 'black' },
      promotion: 'queen',
      isCastle: false,
    });

    expect(hint?.captured).toEqual({ type: 'knight', color: 'black' });
    expect(hint?.promotion).toBe('queen');
  });

  it('derives king-side castling from king move geometry', () => {
    const hint = mapServerHint(VALID_MOVE);
    expect(hint?.isCastle).toBe('king');
  });

  it('derives queen-side castling', () => {
    const hint = mapServerHint({
      ...VALID_MOVE,
      to: { file: 'c', rank: 1 },
    });
    expect(hint?.isCastle).toBe('queen');
  });

  it('returns null for non-castling moves even when isCastle is true', () => {
    const hint = mapServerHint({
      ...VALID_MOVE,
      piece: { type: 'rook', color: 'white' },
      to: { file: 'e', rank: 5 },
    });
    expect(hint?.isCastle).toBeNull();
  });

  it('returns null when required fields are missing or invalid', () => {
    expect(mapServerHint(null)).toBeNull();
    expect(mapServerHint(undefined)).toBeNull();
    expect(mapServerHint({ ...VALID_MOVE, from: null })).toBeNull();
    expect(
      mapServerHint({ ...VALID_MOVE, to: { file: 'z', rank: 9 } }),
    ).toBeNull();
    expect(mapServerHint({ ...VALID_MOVE, piece: null })).toBeNull();
    expect(
      mapServerHint({ ...VALID_MOVE, piece: { type: 'drone', color: 'grey' } }),
    ).toBeNull();
  });

  it('treats malformed optional fields as empty rather than rejecting', () => {
    const hint = mapServerHint({
      ...VALID_MOVE,
      captured: { type: 42, color: undefined },
      promotion: 42,
      isCastle: 'yes',
    });

    expect(hint).not.toBeNull();
    expect(hint?.captured).toBeNull();
    expect(hint?.promotion).toBeNull();
  });
});

describe('mapServerCheckersHint', () => {
  it('maps valid checkers hint with steps', () => {
    const hint = mapServerCheckersHint({
      from: { row: 2, col: 1 },
      to: { row: 3, col: 2 },
      steps: [{ fromRow: 2, fromCol: 1, toRow: 3, toCol: 2 }],
    });
    expect(hint).toEqual({
      gameType: 'checkers',
      from: { row: 2, col: 1 },
      to: { row: 3, col: 2 },
      steps: [{ fromRow: 2, fromCol: 1, toRow: 3, toCol: 2 }],
    });
  });

  it('returns null on invalid checkers payload', () => {
    expect(mapServerCheckersHint(null)).toBeNull();
    expect(mapServerCheckersHint({})).toBeNull();
    expect(mapServerCheckersHint({ from: { row: 'invalid' } })).toBeNull();
    expect(
      mapServerCheckersHint({
        from: { row: 1, col: 2 },
        to: { row: 2, col: 3 },
        steps: [],
      }),
    ).toBeNull();
  });
});

describe('mapServerBackgammonHint', () => {
  it('maps valid numeric and bar/off backgammon moves', () => {
    expect(mapServerBackgammonHint({ from: 24, to: 20 })).toEqual({
      gameType: 'backgammon',
      from: 24,
      to: 20,
    });
    expect(mapServerBackgammonHint({ from: 'bar', to: 20 })).toEqual({
      gameType: 'backgammon',
      from: 'bar',
      to: 20,
    });
    expect(mapServerBackgammonHint({ from: 3, to: 'off' })).toEqual({
      gameType: 'backgammon',
      from: 3,
      to: 'off',
    });
  });

  it('returns null on invalid backgammon payload', () => {
    expect(mapServerBackgammonHint(null)).toBeNull();
    expect(mapServerBackgammonHint({})).toBeNull();
    expect(mapServerBackgammonHint({ from: 'invalid', to: 20 })).toBeNull();
    expect(mapServerBackgammonHint({ from: 10, to: 'invalid' })).toBeNull();
  });
});
