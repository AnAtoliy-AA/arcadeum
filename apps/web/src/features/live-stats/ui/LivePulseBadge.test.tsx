import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LivePulseBadge } from './LivePulseBadge';
import { useLiveStatsStore } from '../store/liveStatsStore';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('LivePulseBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLiveStatsStore.setState({
      stats: {
        onlineUsers: 42,
        totalUsers: 100,
        totalMatches: 200,
        totalSubscribers: 10,
        platformSubscribers: {},
        activeGames: 3,
        waitingRooms: 1,
        waitingPlayers: 2,
        matchesToday: 50,
        popularGames: [],
        openRooms: [],
        recentActivity: [],
      },
      isLoading: false,
      isPopoverOpen: false,
      lastFetchedAt: null,
    });
  });

  it('renders online users count and active games', () => {
    render(<LivePulseBadge />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('toggles popover when clicked', () => {
    render(<LivePulseBadge />);
    const button = screen.getByTestId('header-live-pulse-badge');
    fireEvent.click(button);
    expect(useLiveStatsStore.getState().isPopoverOpen).toBe(true);
  });
});
