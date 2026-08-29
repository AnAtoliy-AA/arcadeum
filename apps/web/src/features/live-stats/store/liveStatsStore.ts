import { create } from 'zustand';
import { resolveApiUrl } from '@/shared/lib/api-base';

export interface LivePopularGame {
  gameId: string;
  activePlayers: number;
  matchesCount: number;
  matchesWeekCount?: number;
}

export interface LiveRoomItem {
  id: string;
  gameId: string;
  name: string;
  hostName: string;
  currentPlayers: number;
  maxPlayers: number;
  status: 'lobby' | 'in_progress';
  createdAt: string;
}

export interface LiveActivityItem {
  id: string;
  type: 'victory' | 'streak' | 'room_created';
  gameId: string;
  username: string;
  detail?: string;
  timestamp: string;
}

export interface LiveStatsData {
  onlineUsers: number;
  activeGames: number;
  waitingRooms: number;
  matchesToday: number;
  popularGames: LivePopularGame[];
  openRooms: LiveRoomItem[];
  recentActivity: LiveActivityItem[];
}

const DEFAULT_STATS: LiveStatsData = {
  onlineUsers: 0,
  activeGames: 0,
  waitingRooms: 0,
  matchesToday: 0,
  popularGames: [],
  openRooms: [],
  recentActivity: [],
};

interface LiveStatsState {
  stats: LiveStatsData;
  isLoading: boolean;
  isPopoverOpen: boolean;
  lastFetchedAt: number | null;
  fetchLiveStats: (force?: boolean) => Promise<void>;
  setLiveStats: (data: Partial<LiveStatsData>) => void;
  togglePopover: () => void;
  setPopoverOpen: (open: boolean) => void;
}

export const useLiveStatsStore = create<LiveStatsState>((set, get) => ({
  stats: DEFAULT_STATS,
  isLoading: false,
  isPopoverOpen: false,
  lastFetchedAt: null,

  fetchLiveStats: async (force = false) => {
    const now = Date.now();
    const { lastFetchedAt, isLoading } = get();
    if (
      !force &&
      (isLoading || (lastFetchedAt && now - lastFetchedAt < 3000))
    ) {
      return;
    }

    set({ isLoading: true });
    try {
      const url = resolveApiUrl('/games/live-info');
      const response = await fetch(url, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (response.ok) {
        const data = (await response.json()) as LiveStatsData;
        set({
          stats: {
            ...DEFAULT_STATS,
            ...data,
          },
          lastFetchedAt: Date.now(),
        });
      }
    } catch {
      // Graceful fallback to existing or default stats
    } finally {
      set({ isLoading: false });
    }
  },

  setLiveStats: (data: Partial<LiveStatsData>) => {
    set((state) => ({
      stats: {
        ...state.stats,
        ...data,
      },
    }));
  },

  togglePopover: () => {
    set((state) => ({ isPopoverOpen: !state.isPopoverOpen }));
  },

  setPopoverOpen: (open: boolean) => {
    set({ isPopoverOpen: open });
  },
}));
