import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGameEndState } from './useGameEndState';
import { useRematch } from './useRematch';

vi.mock('./useRematch', () => ({
  useRematch: vi.fn(),
}));

describe('useGameEndState', () => {
  const mockHandleRematch = vi.fn();
  const mockOpenRematchModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRematch).mockReturnValue({
      rematchLoading: false,
      rematchError: null,
      showRematchModal: false,
      openRematchModal: mockOpenRematchModal,
      closeRematchModal: vi.fn(),
      handleRematch: mockHandleRematch,
      invitation: null,
      invitationTimeLeft: 0,
      handleAcceptInvitation: vi.fn(),
      handleDeclineInvitation: vi.fn(),
      isAcceptingInvitation: false,
      handleReinvite: vi.fn(),
      handleBlockRematch: vi.fn(),
      handleBlockUser: vi.fn(),
      waiting: {
        roomId: 'new-room-1',
        status: 'pending' as const,
        pendingUserIds: ['user-2'],
        acceptedUserIds: [],
        declinedUserIds: [],
      },
      waitingTimeLeft: 25,
      cancelRematch: vi.fn(),
      joinRematchRoom: vi.fn(),
      dismissWaiting: vi.fn(),
    });
  });

  it('directly triggers rematch with opponent in two-player match', () => {
    const players = [
      { playerId: 'user-1', displayName: 'Player 1', alive: true },
      { playerId: 'user-2', displayName: 'Player 2', alive: true },
    ];

    const { result } = renderHook(() =>
      useGameEndState({
        roomId: 'room-1',
        currentUserId: 'user-1',
        session: null,
        result: 'victory',
        players,
      }),
    );

    act(() => {
      result.current.handleResultRematchClick();
    });

    expect(mockHandleRematch).toHaveBeenCalledWith(['user-2'], undefined);
    expect(mockOpenRematchModal).not.toHaveBeenCalled();
  });

  it('opens participant modal when more than two players are present', () => {
    const players = [
      { playerId: 'user-1', displayName: 'Player 1', alive: true },
      { playerId: 'user-2', displayName: 'Player 2', alive: true },
      { playerId: 'user-3', displayName: 'Player 3', alive: true },
    ];

    const { result } = renderHook(() =>
      useGameEndState({
        roomId: 'room-1',
        currentUserId: 'user-1',
        session: null,
        result: 'victory',
        players,
      }),
    );

    act(() => {
      result.current.handleResultRematchClick();
    });

    expect(mockOpenRematchModal).toHaveBeenCalled();
    expect(mockHandleRematch).not.toHaveBeenCalled();
  });

  it('exposes waiting state, countdown, and cancellation actions', () => {
    const { result } = renderHook(() =>
      useGameEndState({
        roomId: 'room-1',
        currentUserId: 'user-1',
        session: null,
        result: 'victory',
        players: [],
      }),
    );

    expect(result.current.waiting).toEqual({
      roomId: 'new-room-1',
      status: 'pending',
      pendingUserIds: ['user-2'],
      acceptedUserIds: [],
      declinedUserIds: [],
    });
    expect(result.current.waitingTimeLeft).toBe(25);
    expect(typeof result.current.cancelRematch).toBe('function');
    expect(typeof result.current.joinRematchRoom).toBe('function');
    expect(typeof result.current.dismissWaiting).toBe('function');
  });
});
