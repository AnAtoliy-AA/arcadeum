import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRematch } from './useRematch';
import { rematchApi } from '@/features/rematch/api';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/shared/config/useRoutes', () => ({
  useRoutes: () => ({
    gameRoom: (id: string) => `/games/rooms/${id}`,
  }),
}));

const mockSnapshot = {
  userId: 'user-1',
  accessToken: 'token-123',
};

vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({
    snapshot: mockSnapshot,
  }),
}));

const socketHandlers = new Map<string, (payload: unknown) => void>();
vi.mock('@/shared/lib/socket', () => ({
  useSocket: (event: string, handler: (payload: unknown) => void) => {
    socketHandlers.set(event, handler);
  },
}));

vi.mock('@/features/rematch/api', () => ({
  rematchApi: {
    createRematch: vi.fn(),
    acceptInvitation: vi.fn(),
    declineInvitation: vi.fn(),
    cancelInvitation: vi.fn().mockResolvedValue({}),
    blockRematch: vi.fn(),
    reinvitePlayers: vi.fn(),
  },
}));

vi.mock('@/shared/hooks/useMutation', () => ({
  useMutation: (fn: (...args: unknown[]) => Promise<unknown>) => {
    const mutate = vi.fn((...args: unknown[]) => fn(...args));
    return {
      mutate,
      isLoading: false,
      error: null,
    };
  },
}));

vi.mock('@/features/games/store/gameRematchStore', () => {
  const store = {
    history: {},
    recordInvitation: vi.fn(),
    clearHistory: vi.fn(),
  };
  const hook = () => store;
  hook.getState = () => store;
  hook.setState = vi.fn();
  return {
    useGameRematchStore: hook,
  };
});

describe('useRematch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    socketHandlers.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates waiting state on games.rematch.status accepted', () => {
    renderHook(() => useRematch({ roomId: 'room-1' }));

    const statusHandler = socketHandlers.get('games.rematch.status');
    expect(statusHandler).toBeDefined();

    act(() => {
      statusHandler?.({
        oldRoomId: 'room-1',
        newRoomId: 'room-2',
        status: 'accepted',
        userId: 'user-2',
        pendingUserIds: [],
        acceptedUserIds: ['user-1', 'user-2'],
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/games/rooms/room-2');
  });

  it('updates waiting state to partial on partial acceptance for multiplayer', () => {
    const { result } = renderHook(() => useRematch({ roomId: 'room-1' }));

    const statusHandler = socketHandlers.get('games.rematch.status');
    expect(statusHandler).toBeDefined();

    act(() => {
      statusHandler?.({
        oldRoomId: 'room-1',
        newRoomId: 'room-2',
        status: 'declined',
        userId: 'user-3',
        pendingUserIds: [],
        acceptedUserIds: ['user-1', 'user-2'],
        declinedUserIds: ['user-3'],
      });
    });

    expect(result.current.waiting).toEqual({
      newRoomId: 'room-2',
      pendingUserIds: [],
      acceptedUserIds: ['user-1', 'user-2'],
      declinedUserIds: ['user-3'],
      status: 'partial',
    });

    act(() => {
      result.current.joinRematchRoom();
    });

    expect(mockPush).toHaveBeenCalledWith('/games/rooms/room-2');
  });

  it('allows initiator to cancel rematch request', async () => {
    const { result } = renderHook(() => useRematch({ roomId: 'room-1' }));

    const statusHandler = socketHandlers.get('games.rematch.status');
    act(() => {
      statusHandler?.({
        oldRoomId: 'room-1',
        newRoomId: 'room-2',
        status: 'waiting',
        userId: 'user-1',
        pendingUserIds: ['user-2'],
      });
    });

    expect(result.current.waiting?.status).toBe('waiting');

    await act(async () => {
      result.current.cancelRematch();
    });

    expect(rematchApi.cancelInvitation).toHaveBeenCalledWith('room-2', {
      token: 'token-123',
    });
    expect(result.current.waiting?.status).toBe('cancelled');
  });

  it('counts down waiting timer and cancels when reaching 0', async () => {
    const { result } = renderHook(() => useRematch({ roomId: 'room-1' }));

    const statusHandler = socketHandlers.get('games.rematch.status');
    act(() => {
      statusHandler?.({
        oldRoomId: 'room-1',
        newRoomId: 'room-2',
        status: 'waiting',
        userId: 'user-1',
        pendingUserIds: ['user-2'],
      });
    });

    expect(result.current.waitingTimeLeft).toBe(30);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.waitingTimeLeft).toBe(25);

    act(() => {
      vi.advanceTimersByTime(25000);
    });

    expect(result.current.waitingTimeLeft).toBe(0);
    expect(rematchApi.cancelInvitation).toHaveBeenCalledWith('room-2', {
      token: 'token-123',
    });
    expect(result.current.waiting?.status).toBe('expired');

    act(() => {
      result.current.dismissWaiting();
    });

    expect(result.current.waiting).toBeNull();
  });
});
