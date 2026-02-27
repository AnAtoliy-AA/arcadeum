import { create } from 'zustand';
import { gameSocket } from '@/shared/lib/socket';
import { maybeDecrypt } from '@/shared/lib/socket-encryption';
import { gamesApi } from '../api';
import type { GameRoomSummary, GameInitialData } from '@/shared/types/games';

/**
 * Cleanup function to remove all registered socket listeners.
 * Stored at module level to persist across store calls.
 */
let cleanupListeners: (() => void) | null = null;

interface GameState {
  room: GameRoomSummary | null;
  session: unknown | null;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  idlePlayers: string[];
  accessToken: string | null;

  connect: (
    roomId: string,
    userId: string | null,
    accessToken: string | null,
    mode?: 'play' | 'watch',
    inviteCode?: string,
    initialData?: GameInitialData,
  ) => void;
  disconnect: () => void;
  joinRoom: (
    roomId: string,
    userId: string | null,
    mode: 'play' | 'watch',
    inviteCode?: string,
  ) => void;
  leaveRoom: (roomId: string, userId: string | null) => void;
  deleteRoom: (roomId: string) => Promise<void>;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  room: null,
  session: null,
  isConnected: false,
  loading: false,
  error: null,
  idlePlayers: [],
  accessToken: null,

  connect: (
    roomId,
    userId,
    accessToken,
    mode = 'play',
    inviteCode,
    initialData,
  ) => {
    // Clean up previous listeners before registering new ones
    if (cleanupListeners) {
      cleanupListeners();
      cleanupListeners = null;
    }

    if (mode !== 'watch' && !accessToken && !userId) return;

    // Preserve existing room if it's the same roomId to prevent flickering
    const currentState = get();
    const isSameRoom = currentState.room?.id === roomId;

    set({
      loading: !isSameRoom && !initialData?.room,
      error: isSameRoom ? currentState.error : null,
      room: initialData?.room || (isSameRoom ? currentState.room : null),
      session:
        initialData?.session || (isSameRoom ? currentState.session : null),
      accessToken,
    });

    // Define handlers
    const handleJoined = (payload: {
      room?: GameRoomSummary;
      session?: unknown;
    }) => {
      if (payload?.room && payload.room.id === roomId) {
        set({
          room: payload.room,
          session: payload.session ?? null,
          loading: false,
          error: null,
        });
      } else {
      }
    };

    const handleRoomUpdate = (payload: { room?: GameRoomSummary }) => {
      if (payload?.room && payload.room.id === roomId) {
        set({ room: payload.room });
      }
    };

    const handleGameStarted = (payload: {
      room?: GameRoomSummary;
      session?: unknown;
    }) => {
      if (payload?.room && payload.room.id === roomId) {
        set({ room: payload.room, session: payload.session ?? null });
      }
    };

    const handleException = (payload: { message?: string }) => {
      const message = payload?.message || 'An error occurred';
      set({ error: message, loading: false });
    };

    const handleConnect = () => {
      set({ isConnected: true });
      get().joinRoom(roomId, userId, mode, inviteCode);
    };

    const handleDisconnect = () => {
      set({ isConnected: false });
    };

    const handlePlayerJoined = (payload: { room?: GameRoomSummary }) => {
      if (payload?.room && payload.room.id === roomId) {
        set({ room: payload.room });
      }
    };

    const handlePlayerLeft = (payload: {
      room?: GameRoomSummary;
      userId?: string;
      roomDeleted?: boolean;
    }) => {
      // If the room was deleted, or if this room update belongs to our current room
      if (payload?.roomDeleted && payload.room?.id === roomId) {
        set({ room: null, session: null, error: 'Room was deleted' });
      } else if (payload?.room && payload.room.id === roomId) {
        set({ room: payload.room });
      }
    };

    // Decrypt wrapper
    const decryptHandler = <T>(
      handler: (payload: T) => void,
      _name: string,
    ) => {
      return async (raw: unknown) => {
        const payload = await maybeDecrypt<T>(raw);
        if (payload !== null) {
          handler(payload);
        }
      };
    };

    const wrappedHandleJoined = decryptHandler(handleJoined, 'joined');
    const wrappedHandleRoomUpdate = decryptHandler(handleRoomUpdate, 'update');
    const wrappedHandlePlayerJoined = decryptHandler(
      handlePlayerJoined,
      'playerJoined',
    );
    const wrappedHandlePlayerLeft = decryptHandler(
      handlePlayerLeft,
      'playerLeft',
    );
    const wrappedHandleGameStarted = decryptHandler(
      handleGameStarted,
      'gameStarted',
    );
    const wrappedHandleException = decryptHandler(handleException, 'exception');

    const handleIdleChanged = (payload: {
      userId?: string;
      idle?: boolean;
    }) => {
      if (!payload?.userId) return;
      const current = get().idlePlayers;
      if (payload.idle) {
        if (!current.includes(payload.userId)) {
          set({ idlePlayers: [...current, payload.userId] });
        }
      } else {
        set({ idlePlayers: current.filter((id) => id !== payload.userId) });
      }
    };

    gameSocket.on('games.room.joined', wrappedHandleJoined);
    gameSocket.on('games.room.watching', wrappedHandleJoined);
    gameSocket.on('games.room.update', wrappedHandleRoomUpdate);
    gameSocket.on('games.player.joined', wrappedHandlePlayerJoined);
    gameSocket.on('games.player.left', wrappedHandlePlayerLeft);
    gameSocket.on('games.game.started', wrappedHandleGameStarted);
    gameSocket.on('exception', wrappedHandleException);
    gameSocket.on('connect', handleConnect);
    gameSocket.on('disconnect', handleDisconnect);

    const wrappedHandleIdleChanged = decryptHandler<{
      userId?: string;
      idle?: boolean;
    }>(handleIdleChanged, 'idleChanged');
    gameSocket.on('games.player.idle_changed', wrappedHandleIdleChanged);

    // Store cleanup function to properly remove listeners later
    cleanupListeners = () => {
      gameSocket.off('games.room.joined', wrappedHandleJoined);
      gameSocket.off('games.room.watching', wrappedHandleJoined);
      gameSocket.off('games.room.update', wrappedHandleRoomUpdate);
      gameSocket.off('games.player.joined', wrappedHandlePlayerJoined);
      gameSocket.off('games.player.left', wrappedHandlePlayerLeft);
      gameSocket.off('games.game.started', wrappedHandleGameStarted);
      gameSocket.off('exception', wrappedHandleException);
      gameSocket.off('connect', handleConnect);
      gameSocket.off('disconnect', handleDisconnect);
      gameSocket.off('games.player.idle_changed', wrappedHandleIdleChanged);
    };

    // If already connected
    if (gameSocket.connected) {
      handleConnect();
    }
  },

  disconnect: () => {
    // Clean up all registered listeners
    if (cleanupListeners) {
      cleanupListeners();
      cleanupListeners = null;
    }

    // We keep the room and session data so the UI doesn't flicker/redirect
    // during token refresh or socket reconnects.
    // Metadata is only cleared on explicit leaveRoom() or hard reset().
    set({
      isConnected: false,
      error: null,
      loading: false,
      idlePlayers: [],
      accessToken: null,
    });
  },

  joinRoom: (roomId, userId, mode, inviteCode) => {
    if (mode === 'watch') {
      set({ loading: true, error: null });
      gameSocket.emit('games.room.watch', { roomId, inviteCode });
    } else if (userId) {
      set({ loading: true, error: null });
      gameSocket.emit('games.room.join', { roomId, userId, inviteCode });
    } else {
      set({ loading: false, error: null });
    }
  },

  leaveRoom: (roomId, userId) => {
    if (roomId && userId) {
      gameSocket.emit('games.room.leave', { roomId, userId });
    }
    set({
      room: null,
      session: null,
      error: null,
      idlePlayers: [],
      accessToken: null,
    });
  },

  deleteRoom: async (roomId) => {
    const { accessToken } = get();
    try {
      await gamesApi.deleteRoom(roomId, { token: accessToken || undefined });
      set({
        room: null,
        session: null,
        error: null,
        idlePlayers: [],
        accessToken: null,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete room';
      set({ error: message });
      throw err;
    }
  },

  reset: () =>
    set({
      room: null,
      session: null,
      error: null,
      loading: false,
      idlePlayers: [],
      accessToken: null,
    }),
}));

// Expose store to window for E2E testing
if (
  typeof window !== 'undefined' &&
  (window as unknown as Record<string, unknown>).isPlaywright
) {
  (window as unknown as Record<string, unknown>).__ZUSTAND_GAME_STORE__ =
    useGameStore;
}
