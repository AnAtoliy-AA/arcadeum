import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { PachisiClientState } from '../types';

const play = vi.fn();
vi.mock('@/shared/lib/game-sounds', () => ({
  useGameSound: () => ({ play }),
}));

import { usePachisiSounds } from './usePachisiSounds';

function snap(
  a: number,
  b: number,
  extra: Partial<PachisiClientState> = {},
): PachisiClientState {
  return {
    phase: 'roll',
    options: { theme: 'adventure' },
    seats: { a: 0, b: 2 },
    tokens: { a: [{ id: 0, progress: a }], b: [{ id: 0, progress: b }] },
    die: null,
    consecutiveSixes: 0,
    currentTurnIndex: 0,
    playerOrder: ['a', 'b'],
    players: [],
    winnerId: null,
    isDraw: false,
    logs: [],
    ...extra,
  };
}

describe('usePachisiSounds', () => {
  beforeEach(() => play.mockClear());

  it('plays capture when a token returns to the yard', () => {
    const { rerender } = renderHook(
      (p: { s: PachisiClientState }) =>
        usePachisiSounds({
          snapshot: p.s,
          myTurn: false,
          isGameOver: false,
          currentUserId: 'a',
        }),
      { initialProps: { s: snap(5, 2) } },
    );
    expect(play).not.toHaveBeenCalled();
    rerender({ s: snap(6, -1) });
    expect(play).toHaveBeenCalledWith('capture');
  });

  it('plays success for the first token reaching home', () => {
    const { rerender } = renderHook(
      (p: { s: PachisiClientState }) =>
        usePachisiSounds({
          snapshot: p.s,
          myTurn: false,
          isGameOver: false,
          currentUserId: 'a',
        }),
      { initialProps: { s: snap(55, 2) } },
    );
    rerender({ s: snap(56, 2) });
    expect(play).toHaveBeenCalledWith('success');
  });

  it('plays notification on turn start and win on game over', () => {
    const { rerender } = renderHook(
      (p: { turn: boolean; over: boolean; s: PachisiClientState }) =>
        usePachisiSounds({
          snapshot: p.s,
          myTurn: p.turn,
          isGameOver: p.over,
          currentUserId: 'a',
        }),
      { initialProps: { turn: false, over: false, s: snap(1, 1) } },
    );
    rerender({ turn: true, over: false, s: snap(1, 1) });
    expect(play).toHaveBeenCalledWith('notification');
    rerender({ turn: true, over: true, s: snap(1, 1, { winnerId: 'a' }) });
    expect(play).toHaveBeenCalledWith('win');
  });
});
