import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCascadeState } from './useCascadeState';
import type { GameSessionSummary } from '@/shared/types/games';
import type { CascadeClientState } from '../types';

// Mock the underlying session subscription so the hook becomes a pure derive
// from `initialSession`.
vi.mock('@/features/games/hooks', () => ({
  useGameSession: ({
    initialSession,
  }: {
    initialSession: GameSessionSummary | null;
  }) => ({
    session: initialSession,
    actionBusy: null,
    setActionBusy: vi.fn(),
    startBusy: false,
  }),
}));

const cascadeState: CascadeClientState = {
  phase: 'playing',
  options: { variant: 'cosmic', stackingEnabled: true },
  players: [
    {
      playerId: 'me',
      alive: true,
      hand: [
        { id: 'r5', color: 'R', kind: 'NUMBER', value: 5 },
        { id: 'b3', color: 'B', kind: 'NUMBER', value: 3 },
      ],
    },
    {
      playerId: 'bot',
      alive: true,
      hand: [
        { id: 'g7', color: 'G', kind: 'NUMBER', value: 7 },
      ],
    },
  ],
  playerOrder: ['me', 'bot'],
  currentTurnIndex: 0,
  direction: 1,
  drawPile: [],
  discardPile: [{ id: 'top', color: 'R', kind: 'NUMBER', value: 9 }],
  topCard: { id: 'top', color: 'R', kind: 'NUMBER', value: 9 },
  activeColor: 'R',
  pendingDraw: 0,
  pendingStackKind: null,
  pendingAction: 'none',
  winnerId: null,
  logs: [],
};

function makeSession(state: CascadeClientState): GameSessionSummary {
  return {
    id: 'session-1',
    roomId: 'room-1',
    gameId: 'cascade_v1',
    status: 'active',
    state: state as unknown as Record<string, unknown>,
  } as unknown as GameSessionSummary;
}

describe('useCascadeState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('derives the snapshot from the session state', () => {
    const { result } = renderHook(() =>
      useCascadeState({
        roomId: 'room-1',
        currentUserId: 'me',
        initialSession: makeSession(cascadeState),
      }),
    );
    expect(result.current.snapshot).toEqual(cascadeState);
  });

  it('marks myTurn=true when the current entry id matches the user', () => {
    const { result } = renderHook(() =>
      useCascadeState({
        roomId: 'room-1',
        currentUserId: 'me',
        initialSession: makeSession(cascadeState),
      }),
    );
    expect(result.current.myTurn).toBe(true);
    expect(result.current.currentEntryId).toBe('me');
  });

  it('marks myTurn=false when the current entry id is someone else', () => {
    const { result } = renderHook(() =>
      useCascadeState({
        roomId: 'room-1',
        currentUserId: 'me',
        initialSession: makeSession({ ...cascadeState, currentTurnIndex: 1 }),
      }),
    );
    expect(result.current.myTurn).toBe(false);
    expect(result.current.currentEntryId).toBe('bot');
  });

  it('exposes myHand restricted to the current user', () => {
    const { result } = renderHook(() =>
      useCascadeState({
        roomId: 'room-1',
        currentUserId: 'me',
        initialSession: makeSession(cascadeState),
      }),
    );
    expect(result.current.myHand).toHaveLength(2);
    expect(result.current.myHand.map((c) => c.id)).toEqual(['r5', 'b3']);
  });

  it('reports isGameOver when phase is game_over', () => {
    const { result } = renderHook(() =>
      useCascadeState({
        roomId: 'room-1',
        currentUserId: 'me',
        initialSession: makeSession({
          ...cascadeState,
          phase: 'game_over',
          winnerId: 'me',
        }),
      }),
    );
    expect(result.current.isGameOver).toBe(true);
  });

  it('returns null snapshot when there is no session', () => {
    const { result } = renderHook(() =>
      useCascadeState({
        roomId: 'room-1',
        currentUserId: 'me',
        initialSession: null,
      }),
    );
    expect(result.current.snapshot).toBeNull();
    expect(result.current.myHand).toEqual([]);
    expect(result.current.myTurn).toBe(false);
  });
});
