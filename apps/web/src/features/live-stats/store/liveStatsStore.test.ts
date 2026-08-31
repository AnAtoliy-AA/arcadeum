import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLiveStatsStore } from './liveStatsStore';

describe('liveStatsStore', () => {
  beforeEach(() => {
    useLiveStatsStore.setState({
      stats: {
        onlineUsers: 1,
        totalUsers: 10,
        totalMatches: 20,
        totalSubscribers: 5,
        platformSubscribers: { discord: 3 },
        activeGames: 0,
        waitingRooms: 0,
        matchesToday: 0,
        popularGames: [],
        openRooms: [],
        recentActivity: [],
      },
      isLoading: false,
      isPopoverOpen: false,
      lastFetchedAt: null,
    });
  });

  it('should initialize with default stats', () => {
    const { stats, isPopoverOpen } = useLiveStatsStore.getState();
    expect(stats.onlineUsers).toBe(1);
    expect(isPopoverOpen).toBe(false);
  });

  it('should toggle popover visibility', () => {
    useLiveStatsStore.getState().togglePopover();
    expect(useLiveStatsStore.getState().isPopoverOpen).toBe(true);
    useLiveStatsStore.getState().togglePopover();
    expect(useLiveStatsStore.getState().isPopoverOpen).toBe(false);
  });

  it('should set popover explicitly', () => {
    useLiveStatsStore.getState().setPopoverOpen(true);
    expect(useLiveStatsStore.getState().isPopoverOpen).toBe(true);
    useLiveStatsStore.getState().setPopoverOpen(false);
    expect(useLiveStatsStore.getState().isPopoverOpen).toBe(false);
  });

  it('should update live stats via setLiveStats', () => {
    useLiveStatsStore.getState().setLiveStats({
      onlineUsers: 120,
      activeGames: 18,
    });
    const { stats } = useLiveStatsStore.getState();
    expect(stats.onlineUsers).toBe(120);
    expect(stats.activeGames).toBe(18);
  });

  it('should fetch live stats from endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        onlineUsers: 250,
        activeGames: 30,
        waitingRooms: 8,
        matchesToday: 150,
        popularGames: [
          { gameId: 'chess_v1', activePlayers: 50, matchesCount: 40 },
        ],
        openRooms: [],
        recentActivity: [],
      }),
    });

    await useLiveStatsStore.getState().fetchLiveStats();
    const { stats, isLoading } = useLiveStatsStore.getState();
    expect(isLoading).toBe(false);
    expect(stats.onlineUsers).toBe(250);
    expect(stats.activeGames).toBe(30);
  });
});
