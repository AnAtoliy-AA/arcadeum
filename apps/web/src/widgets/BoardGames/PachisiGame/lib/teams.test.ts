import { describe, it, expect } from 'vitest';
import {
  controlledOwnerId,
  hasFinishedAll,
  partnerOf,
  teamOfPlayer,
  teamOfSeat,
} from './teams';
import type { PachisiClientState } from '../types';

const tok = (progress: number) =>
  Array.from({ length: 2 }, (_, id) => ({ id, progress }));

function snap(teamMode: boolean, p1Progress = -1): PachisiClientState {
  return {
    phase: 'roll',
    options: { theme: 'adventure' },
    seats: { a: 0, b: 1, c: 2, d: 3 },
    tokens: { a: tok(p1Progress), b: tok(-1), c: tok(-1), d: tok(-1) },
    die: null,
    consecutiveSixes: 0,
    currentTurnIndex: 0,
    playerOrder: ['a', 'b', 'c', 'd'],
    players: [],
    winnerId: null,
    isDraw: false,
    teamMode,
    logs: [],
  };
}

describe('pachisi teams helpers', () => {
  it('pairs opposite seats', () => {
    expect([0, 1, 2, 3].map(teamOfSeat)).toEqual([0, 1, 0, 1]);
    expect(partnerOf(snap(true), 'a')).toBe('c');
    expect(partnerOf(snap(true), 'd')).toBe('b');
    expect(teamOfPlayer(snap(true), 'b')).toBe(1);
  });

  it('has no partners when teams are off', () => {
    expect(partnerOf(snap(false), 'a')).toBeNull();
    expect(teamOfPlayer(snap(false), 'a')).toBeNull();
    expect(partnerOf(snap(true), null)).toBeNull();
  });

  it('controls the partner only after every own token is home', () => {
    expect(controlledOwnerId(snap(true, -1), 'a')).toBe('a');
    expect(controlledOwnerId(snap(true, 20), 'a')).toBe('a');
    expect(hasFinishedAll(snap(true, 56), 'a')).toBe(true);
    expect(controlledOwnerId(snap(true, 56), 'a')).toBe('c');
    expect(controlledOwnerId(snap(false, 56), 'a')).toBe('a');
    expect(controlledOwnerId(snap(true), null)).toBeNull();
  });
});
