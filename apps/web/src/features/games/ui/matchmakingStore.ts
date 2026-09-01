import { create } from 'zustand';

export interface MatchmakingStatus {
  gameId: string;
  variant?: string;
  ranked?: boolean;
  queueSize: number;
  position: number;
  playersAhead: number;
  estimatedWaitSeconds: number;
  activeQueues?: Record<string, number>;
  openRoomsCount?: number;
}

export interface MatchmakingState {
  isQueued: boolean;
  isMinimized: boolean;
  gameId: string | null;
  variant: string | null;
  ranked: boolean | null;
  startTime: number | null;
  queueSize: number | null;
  position: number | null;
  playersAhead: number | null;
  estimatedWaitSeconds: number | null;
  openRoomsCount: number | null;
  activeQueues: Record<string, number>;
  startQueue: (gameId: string, variant?: string, ranked?: boolean) => void;
  stopQueue: () => void;
  setMinimized: (minimized: boolean) => void;
  setQueued: (
    queued: boolean,
    gameId?: string | null,
    variant?: string | null,
    ranked?: boolean | null,
  ) => void;
  setStatus: (status: MatchmakingStatus) => void;
}

export const useMatchmakingStore = create<MatchmakingState>((set, get) => ({
  isQueued: false,
  isMinimized: false,
  gameId: null,
  variant: null,
  ranked: null,
  startTime: null,
  queueSize: null,
  position: null,
  playersAhead: null,
  estimatedWaitSeconds: null,
  openRoomsCount: null,
  activeQueues: {},
  startQueue: (gameId, variant, ranked) => {
    set({
      isQueued: true,
      isMinimized: false,
      gameId,
      variant: variant ?? null,
      ranked: ranked ?? null,
      startTime: Date.now(),
      queueSize: 1,
      position: 1,
      playersAhead: 0,
      estimatedWaitSeconds: null,
      openRoomsCount: null,
      activeQueues: {},
    });
  },
  stopQueue: () => {
    const { isQueued } = get();
    if (isQueued) {
      set({
        isQueued: false,
        isMinimized: false,
        gameId: null,
        variant: null,
        ranked: null,
        startTime: null,
        queueSize: null,
        position: null,
        playersAhead: null,
        estimatedWaitSeconds: null,
        openRoomsCount: null,
        activeQueues: {},
      });
    }
  },
  setMinimized: (minimized) => {
    set({ isMinimized: minimized });
  },
  setQueued: (queued, gameId = null, variant = null, ranked = null) => {
    set({
      isQueued: queued,
      isMinimized: false,
      gameId,
      variant,
      ranked,
      startTime: queued ? Date.now() : null,
      queueSize: queued ? 1 : null,
      position: queued ? 1 : null,
      playersAhead: queued ? 0 : null,
      estimatedWaitSeconds: null,
      openRoomsCount: null,
      activeQueues: {},
    });
  },
  setStatus: (status) => {
    const position = status.position;
    const playersAhead =
      typeof status.playersAhead === 'number'
        ? status.playersAhead
        : Math.max(0, position - 1);
    set({
      queueSize: status.queueSize,
      position,
      playersAhead,
      estimatedWaitSeconds: status.estimatedWaitSeconds,
      activeQueues: status.activeQueues ?? {},
      openRoomsCount:
        typeof status.openRoomsCount === 'number' ? status.openRoomsCount : 0,
    });
  },
}));
