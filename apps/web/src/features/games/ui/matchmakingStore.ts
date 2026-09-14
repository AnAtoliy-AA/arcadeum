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
  friendsInQueue?: Array<{ userId: string; gameId: string; rating?: number }>;
}

export interface MatchmakingState {
  isQueued: boolean;
  isMinimized: boolean;
  gameId: string | null;
  variant: string | null;
  ranked: boolean | null;
  startTime: number | null;
  activeQueues: Record<string, number>;
  friendsInQueue: Array<{ userId: string; gameId: string; rating?: number }>;
  startQueue: (gameId: string, variant?: string, ranked?: boolean) => void;
  stopQueue: () => void;
  setMinimized: (minimized: boolean) => void;
  setStatus: (status: MatchmakingStatus) => void;
}

export const useMatchmakingStore = create<MatchmakingState>((set) => ({
  isQueued: false,
  isMinimized: false,
  gameId: null,
  variant: null,
  ranked: null,
  startTime: null,
  activeQueues: {},
  friendsInQueue: [],
  startQueue: (gameId, variant, ranked) => {
    set({
      isQueued: true,
      isMinimized: false,
      gameId,
      variant: variant ?? null,
      ranked: ranked ?? null,
      startTime: Date.now(),
      activeQueues: {},
      friendsInQueue: [],
    });
  },
  stopQueue: () => {
    set({
      isQueued: false,
      isMinimized: false,
      gameId: null,
      variant: null,
      ranked: null,
      startTime: null,
      activeQueues: {},
      friendsInQueue: [],
    });
  },
  setMinimized: (minimized) => {
    set({ isMinimized: minimized });
  },
  setStatus: (status) => {
    set({
      activeQueues: status.activeQueues ?? {},
      friendsInQueue: status.friendsInQueue ?? [],
    });
  },
}));
