import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameRoomActions } from './useGameRoomActions';
import { useGameStore } from '@/features/games/store/gameStore';
import { reorderRoomParticipants } from '@/shared/api/gamesApi';
import type { GameRoomSummary } from '@/shared/types/games';

vi.mock('@/shared/api/gamesApi', () => ({
  reorderRoomParticipants: vi.fn(),
}));

const MOCK_INITIAL_ROOM: GameRoomSummary = {
  id: 'room-123',
  gameId: 'checkers_v1',
  name: 'Test Room',
  hostId: 'host-1',
  visibility: 'public',
  playerCount: 2,
  maxPlayers: 2,
  createdAt: new Date().toISOString(),
  status: 'lobby',
  members: [
    { id: 'host-1', displayName: 'Host', isReady: true, isHost: true },
    { id: 'player-2', displayName: 'Player 2', isReady: true, isHost: false },
  ],
};

describe('useGameRoomActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      room: null,
      accessToken: 'token-abc',
      deleteRoom: vi.fn(),
      kickPlayer: vi.fn(),
      leaveRoom: vi.fn(),
      refreshRoom: vi.fn(),
    });
  });

  it('resolves initial room and exposes action handlers', () => {
    const { result } = renderHook(() =>
      useGameRoomActions('room-123', MOCK_INITIAL_ROOM),
    );
    expect(result.current.room).toEqual(MOCK_INITIAL_ROOM);
    expect(result.current.onLeaveRoom).toBeTypeOf('function');
    expect(result.current.onDeleteRoom).toBeTypeOf('function');
    expect(result.current.onKickPlayer).toBeTypeOf('function');
    expect(result.current.onRefresh).toBeTypeOf('function');
    expect(result.current.onReorderPlayers).toBeTypeOf('function');
  });

  it('calls reorderRoomParticipants with new order and accessToken', async () => {
    vi.mocked(reorderRoomParticipants).mockResolvedValueOnce({
      room: MOCK_INITIAL_ROOM,
    });
    const { result } = renderHook(() =>
      useGameRoomActions('room-123', MOCK_INITIAL_ROOM),
    );

    await act(async () => {
      await result.current.onReorderPlayers(['player-2', 'host-1']);
    });

    expect(reorderRoomParticipants).toHaveBeenCalledWith(
      'room-123',
      ['player-2', 'host-1'],
      'token-abc',
    );
  });

  it('triggers refreshRoom on reorder error', async () => {
    const refreshRoom = vi.fn();
    useGameStore.setState({ refreshRoom });
    vi.mocked(reorderRoomParticipants).mockRejectedValueOnce(
      new Error('Reorder failed'),
    );

    const { result } = renderHook(() =>
      useGameRoomActions('room-123', MOCK_INITIAL_ROOM),
    );

    await act(async () => {
      await result.current.onReorderPlayers(['player-2', 'host-1']);
    });

    expect(refreshRoom).toHaveBeenCalledWith('room-123');
  });
});
