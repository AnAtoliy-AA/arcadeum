import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCheckersCoach } from './useCheckersCoach';
import type { GameRoomSummary } from '@/shared/types/games';
import type { CheckersState } from '@arcadeum/games-core/games/checkers/checkers.types';

const mockRoom: GameRoomSummary = {
  id: 'room-local-1',
  name: 'Test Room',
  gameId: 'checkers_v1',
  hostId: 'user-a',
  status: 'playing',
  maxPlayers: 2,
  minPlayers: 2,
  members: [],
  playerOrder: ['user-a', 'bot-b'],
  createdAt: Date.now(),
  gameOptions: { ranked: false },
};

function makeState(): CheckersState {
  const board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));
  board[2][1] = { playerId: 'user-a', type: 'man' };
  return {
    phase: 'playing',
    options: {
      mode: 'american',
      forcedCaptures: true,
      backwardCaptures: false,
      theme: 'classic',
    },
    board,
    currentTurnIndex: 0,
    playerOrder: ['user-a', 'bot-b'],
    players: [
      {
        playerId: 'user-a',
        color: 'light',
        alive: true,
        piecesRemaining: 1,
      },
      {
        playerId: 'bot-b',
        color: 'dark',
        alive: true,
        piecesRemaining: 1,
      },
    ],
    winnerId: null,
    isDraw: false,
  };
}

describe('useCheckersCoach', () => {
  it('provides hint on demand for human player turn', () => {
    const state = makeState();
    const { result } = renderHook(() =>
      useCheckersCoach({
        room: mockRoom,
        currentUserId: 'user-a',
        snapshot: state,
        myTurn: true,
        isGameOver: false,
      }),
    );

    expect(result.current.visible).toBe(true);
    expect(result.current.hintAvailable).toBe(true);
    expect(result.current.hint).toBeNull();

    act(() => {
      result.current.requestHint();
    });

    expect(result.current.hint).not.toBeNull();
    expect(result.current.hint?.from).toEqual({ row: 2, col: 1 });
  });

  it('suppresses hint when game is over or not my turn', () => {
    const state = makeState();
    const { result } = renderHook(() =>
      useCheckersCoach({
        room: mockRoom,
        currentUserId: 'user-a',
        snapshot: state,
        myTurn: false,
        isGameOver: false,
      }),
    );

    expect(result.current.hintAvailable).toBe(false);
  });
});
