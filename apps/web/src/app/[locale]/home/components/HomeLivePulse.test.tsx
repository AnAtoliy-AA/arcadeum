import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomeLivePulse } from './HomeLivePulse';
import { useLiveStatsStore } from '@/features/live-stats';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

import { buildRoutes } from '@/shared/config/routes';

vi.mock('@/shared/config/useRoutes', () => ({
  useRoutes: () => buildRoutes('en'),
}));

describe('HomeLivePulse', () => {
  it('renders home live pulse section', () => {
    useLiveStatsStore.setState({
      stats: {
        onlineUsers: 88,
        totalUsers: 500,
        totalMatches: 300,
        totalSubscribers: 25,
        platformSubscribers: {},
        activeGames: 6,
        waitingRooms: 3,
        waitingPlayers: 5,
        matchesToday: 40,
        popularGames: [],
        openRooms: [],
        recentActivity: [],
      },
    });

    render(<HomeLivePulse />);
    expect(screen.getByTestId('home-live-pulse-section')).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();
  });
});
