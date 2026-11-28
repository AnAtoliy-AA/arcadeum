import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { PachisiClientState } from '../types';
import { usePachisiAnnouncement } from './usePachisiAnnouncement';

function snap(a: number, b: number, die: number | null): PachisiClientState {
  return {
    phase: die ? 'move' : 'roll',
    options: { theme: 'adventure' },
    seats: { a: 0, b: 2 },
    tokens: { a: [{ id: 0, progress: a }], b: [{ id: 0, progress: b }] },
    die,
    consecutiveSixes: 0,
    currentTurnIndex: 0,
    playerOrder: ['a', 'b'],
    players: [],
    winnerId: null,
    isDraw: false,
    logs: [],
  };
}

describe('usePachisiAnnouncement', () => {
  const nameOf = (id?: string | null) => `P-${id}`;
  type P = { s: PachisiClientState; turn: boolean };
  const run = (initial: P) =>
    renderHook(
      (p: P) =>
        usePachisiAnnouncement({
          snapshot: p.s,
          myTurn: p.turn,
          currentUserId: 'a',
          nameOf,
        }),
      {
        initialProps: initial,
      },
    );

  it('is silent on the first snapshot', () => {
    expect(run({ s: snap(1, 1, null), turn: false }).result.current).toBe('');
  });

  it('announces a roll, a capture and the new turn', () => {
    const { result, rerender } = run({ s: snap(5, 2, null), turn: true });
    rerender({ s: snap(5, 2, 3), turn: true });
    expect(result.current).toContain('announce.rolled');
    rerender({ s: snap(6, -1, null), turn: false });
    expect(result.current).toContain('announce.captured');
    rerender({ s: snap(6, -1, null), turn: true });
    expect(result.current).toContain('announce.yourTurn');
  });

  it('announces a token reaching home', () => {
    const { result, rerender } = run({ s: snap(55, 2, 1), turn: true });
    rerender({ s: snap(56, 2, null), turn: true });
    expect(result.current).toContain('announce.tokenHome');
  });
});
