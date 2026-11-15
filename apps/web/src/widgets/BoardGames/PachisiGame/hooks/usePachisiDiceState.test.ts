import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  extractLastRoll,
  hasRecentNoMoves,
  usePachisiDiceState,
} from './usePachisiDiceState';
import type { PachisiClientState } from '../types';

const baseMockState: PachisiClientState = {
  phase: 'roll',
  options: { theme: 'adventure', aiDifficulty: 'medium' },
  seats: { p1: 0, p2: 2 },
  tokens: {
    p1: [{ id: 0, progress: -1 }],
    p2: [{ id: 0, progress: -1 }],
  },
  die: null,
  consecutiveSixes: 0,
  currentTurnIndex: 0,
  playerOrder: ['p1', 'p2'],
  players: [
    { playerId: 'p1', seat: 0, color: 'red', alive: true },
    { playerId: 'p2', seat: 2, color: 'yellow', alive: true },
  ],
  winnerId: null,
  isDraw: false,
  logs: [],
};

describe('usePachisiDiceState', () => {
  it('detects no moves from logs when not in move phase', () => {
    const withLog: PachisiClientState = {
      ...baseMockState,
      phase: 'roll',
      logs: [
        {
          id: '1',
          type: 'system',
          message: 'Rolled a 4. No legal moves available. Turn passes.',
          timestamp: 100,
        },
      ],
    };
    expect(hasRecentNoMoves(withLog)).toBe(true);
  });

  it('extracts roll from logs when die is not in state', () => {
    const withLog: PachisiClientState = {
      ...baseMockState,
      die: null,
      logs: [
        {
          id: '1',
          type: 'action',
          message: 'Player rolled a 5.',
          senderId: 'p1',
          timestamp: 100,
        },
      ],
    };
    const extracted = extractLastRoll(withLog);
    expect(extracted).toEqual({ die: 5, rollerId: 'p1' });
  });

  it('correctly reports canRoll and canMove based on turn and phase', () => {
    const { result: rollResult } = renderHook(() =>
      usePachisiDiceState(baseMockState, 'p1', true, false),
    );
    expect(rollResult.current.canRoll).toBe(true);
    expect(rollResult.current.canMove).toBe(false);

    const moveState: PachisiClientState = {
      ...baseMockState,
      phase: 'move',
      die: 4,
    };
    const { result: moveResult } = renderHook(() =>
      usePachisiDiceState(moveState, 'p1', true, false),
    );
    expect(moveResult.current.canRoll).toBe(false);
    expect(moveResult.current.canMove).toBe(true);
    expect(moveResult.current.effectiveLastDie).toBe(4);
  });
});
