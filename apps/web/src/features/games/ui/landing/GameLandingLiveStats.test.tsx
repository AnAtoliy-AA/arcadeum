import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameLandingLiveStats } from './GameLandingLiveStats';
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

vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({
    snapshot: { userId: 'user-123' },
  }),
}));

describe('GameLandingLiveStats', () => {
  it('renders live stats for game landing', () => {
    useLiveStatsStore.setState({
      stats: {
        onlineUsers: 15,
        totalUsers: 50,
        totalMatches: 30,
        totalSubscribers: 5,
        platformSubscribers: {},
        activeGames: 2,
        waitingRooms: 1,
        waitingPlayers: 4,
        matchesToday: 12,
        popularGames: [],
        openRooms: [
          {
            id: 'room-1',
            gameId: 'chess_v1',
            name: 'Chess Arena',
            hostId: 'host-1',
            hostName: 'Grandmaster',
            currentPlayers: 1,
            maxPlayers: 2,
            status: 'lobby',
            createdAt: '2026-09-01T00:00:00Z',
          },
        ],
        recentActivity: [],
      },
    });

    render(<GameLandingLiveStats gameId="chess_v1" />);
    expect(screen.getByTestId('game-landing-live-stats')).toBeInTheDocument();
    expect(screen.getByTestId('landing-live-open-lobbies')).toBeInTheDocument();
  });
});
