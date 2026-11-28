import { describe, it, expect } from 'vitest';
import { getChessEndReason } from './end-reason';
import type { ChessClientState } from '../types';

type Snap = Parameters<typeof getChessEndReason>[0];

const base: NonNullable<Snap> = {
  variant: 'standard',
  winnerColor: 'white',
  clocks: null,
  isCheckmate: false,
  isStalemate: false,
  isDrawByRepetition: false,
  isDrawByFiftyMoveRule: false,
  isInsufficientMaterial: false,
  isDrawByAgreement: false,
};

const clocks = (white: number, black: number): ChessClientState['clocks'] => ({
  white: { remainingSeconds: white, lastMoveTimestamp: 1 },
  black: { remainingSeconds: black, lastMoveTimestamp: 1 },
});

describe('getChessEndReason', () => {
  it('returns null while the game is running or loading', () => {
    expect(getChessEndReason(base, false)).toBeNull();
    expect(getChessEndReason(null, true)).toBeNull();
  });

  it('prefers a known server endReason', () => {
    expect(
      getChessEndReason(
        { ...base, isCheckmate: true, endReason: 'timeout' },
        true,
      ),
    ).toBe('timeout');
  });

  it('honours the optional aborted and draw-by-timeout flags', () => {
    expect(
      getChessEndReason({ ...base, winnerColor: null, isAborted: true }, true),
    ).toBe('aborted');
    expect(
      getChessEndReason(
        { ...base, winnerColor: null, isDrawByTimeout: true },
        true,
      ),
    ).toBe('timeout_vs_insufficient');
  });

  it('ignores an unknown server endReason', () => {
    expect(
      getChessEndReason(
        { ...base, isCheckmate: true, endReason: 'nope' },
        true,
      ),
    ).toBe('checkmate');
  });

  it.each([
    ['isCheckmate', 'checkmate'],
    ['isStalemate', 'stalemate'],
    ['isDrawByRepetition', 'repetition'],
    ['isDrawByFiftyMoveRule', 'fifty_move'],
    ['isDrawByAgreement', 'agreement'],
    ['isInsufficientMaterial', 'insufficient_material'],
  ] as const)('maps %s to %s', (flag, reason) => {
    expect(getChessEndReason({ ...base, [flag]: true }, true)).toBe(reason);
  });

  it('detects a loss on time from an empty clock', () => {
    expect(getChessEndReason({ ...base, clocks: clocks(30, 0) }, true)).toBe(
      'timeout',
    );
  });

  it('detects a timeout drawn by insufficient material', () => {
    expect(
      getChessEndReason(
        {
          ...base,
          winnerColor: null,
          isInsufficientMaterial: true,
          clocks: clocks(0, 12),
        },
        true,
      ),
    ).toBe('timeout_vs_insufficient');
  });

  it('falls back to resignation for a decisive game without mate', () => {
    expect(getChessEndReason({ ...base, clocks: clocks(30, 12) }, true)).toBe(
      'resignation',
    );
  });

  it('reports a variant win for king of the hill style variants', () => {
    expect(
      getChessEndReason({ ...base, variant: 'king_of_the_hill' }, true),
    ).toBe('variant_win');
  });

  it('reports an aborted game when there is no winner and no draw', () => {
    expect(getChessEndReason({ ...base, winnerColor: null }, true)).toBe(
      'aborted',
    );
  });
});
