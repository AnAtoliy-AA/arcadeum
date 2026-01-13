import { create } from 'zustand';
import { gameSocket } from '@/shared/lib/socket';
import { maybeDecrypt } from '@/shared/lib/socket-encryption';
import type { GameRoomSummary } from '@/shared/types/games';

interface GameState {
  room: GameRoomSummary | null;
  session: unknown | null;
  isConnected: boolean;
  loading: boolean;
  error: string | null;

  connect: (
    roomId: string,
    userId: string | null,
    accessToken: string | null,
    mode?: 'play' | 'watch',
  ) => void;
  disconnect: () => void;
  joinRoom: (
    roomId: string,
    userId: string | null,
    mode: 'play' | 'watch',
  ) => void;
  leaveRoom: (roomId: string, userId: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  room: null,
  session: null,
  isConnected: false,
  loading: false,
  error: null,

  connect: (roomId, userId, accessToken, mode = 'play') => {
    // This action sets up the listeners and connection logic.
    // It's similar to the useEffect in useGameRoom

    if (mode !== 'watch' && !accessToken) return;

    set({ loading: true, error: null });

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
      // Auto-clear error logic could be in component or here with timeout
      setTimeout(() => set({ error: null }), 5000);
    };

    const handleConnect = () => {
      set({ isConnected: true });
      get().joinRoom(roomId, userId, mode);
    };

    const handleDisconnect = () => {
      set({ isConnected: false, loading: true });
    };

    const handlePlayerJoined = (payload: { room?: GameRoomSummary }) => {
      if (payload?.room && payload.room.id === roomId) {
        set({ room: payload.room });
      }
    };

    // Decrypt wrapper
    const decryptHandler = <T>(handler: (payload: T) => void) => {
      return async (raw: unknown) => {
        const payload = await maybeDecrypt<T>(raw);
        handler(payload);
      };
    };

    const wrappedHandleJoined = decryptHandler(handleJoined);
    const wrappedHandleRoomUpdate = decryptHandler(handleRoomUpdate);
    const wrappedHandlePlayerJoined = decryptHandler(handlePlayerJoined);
    const wrappedHandleGameStarted = decryptHandler(handleGameStarted);
    const wrappedHandleException = decryptHandler(handleException);

    // Register
    gameSocket.on('games.room.joined', wrappedHandleJoined);
    gameSocket.on('games.room.watching', wrappedHandleJoined);
    gameSocket.on('games.room.update', wrappedHandleRoomUpdate);
    gameSocket.on('games.player.joined', wrappedHandlePlayerJoined);
    gameSocket.on('games.game.started', wrappedHandleGameStarted);
    gameSocket.on('exception', wrappedHandleException);
    gameSocket.on('connect', handleConnect);
    gameSocket.on('disconnect', handleDisconnect);

    // If already connected
    if (gameSocket.connected) {
      handleConnect();
    }
  },

  disconnect: () => {
    // Remove all listeners (specific ones, ideally we should store references or remove all for these events)
    // Since we can't easily unmount unnamed wrappers, we might need to store them in the store state?
    // OR we just use gameSocket.off with the exact same wrapper reference.
    // BUT, the wrappers are created inside 'connect'. We can't reach them here.
    // Ideally, the store shouldn't hold the listeners themselves, or 'disconnect' should just be a cleanup
    // called from a useEffect in a "SocketController" component, NOT from a global store action that loses context.
    // Alternatively, we can make 'connect' return a cleanup function.
    // Recommendation: Create a `useGameSocket` hook that calls `useGameStore` actions to update state,
    // instead of putting socket listeners INSIDE the store actions.
    // This is much cleaner for React lifecycles.
    // Let's adjust the plan:
    // useGameStore will hold DATA (room, session).
    // useGameSocket (or modified useGameRoom) will hold LISTENERS and call store.setRoom().
    // This avoids the 'where do I store listener references' problem in vanilla Zustand actions.
    // So, I will implement a data-only store first, then update useGameRoom to populate it.
  },

  joinRoom: (roomId, userId, mode) => {
    if (mode === 'watch') {
      gameSocket.emit('games.room.watch', { roomId });
    } else if (userId) {
      gameSocket.emit('games.room.join', { roomId, userId });
    }
  },

  leaveRoom: (roomId, userId) => {
    if (roomId && userId) {
      gameSocket.emit('games.room.leave', { roomId, userId });
    }
    set({ room: null, session: null, error: null });
  },

  reset: () => set({ room: null, session: null, error: null, loading: false }),
}));
