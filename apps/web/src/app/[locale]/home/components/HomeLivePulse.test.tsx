import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeLivePulse } from './HomeLivePulse';
import { useLiveStatsStore, type LiveStatsData } from '@/features/live-stats';
import { buildRoutes } from '@/shared/config/routes';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/shared/config/useRoutes', () => ({
  useRoutes: () => buildRoutes('en'),
}));

vi.mock('@/features/games/ui/GamePickerModal', () => ({
  GamePickerModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="game-picker-modal" /> : null,
}));

const routes = buildRoutes('en');

const BASE: LiveStatsData = {
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
};

function setStats(stats: LiveStatsData, lastFetchedAt: number | null) {
  useLiveStatsStore.setState({
    stats,
    lastFetchedAt,
    // Block the mount-time fetch so tests keep the state they set.
    isLoading: true,
  });
}

describe('HomeLivePulse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders counters and plain-words descriptions when there is activity', () => {
    setStats(BASE, Date.now());
    render(<HomeLivePulse />);
    expect(screen.getByTestId('home-live-pulse-section')).toBeInTheDocument();
    expect(screen.getByTestId('live-online-counter')).toHaveTextContent('88');
    expect(screen.getByText('home.liveOnlineSub')).toBeInTheDocument();
    expect(screen.getByText('home.liveWaitingRoomsSub')).toBeInTheDocument();
    expect(screen.getByTestId('live-waiting-rooms-action')).toHaveAttribute(
      'href',
      `${routes.rooms}?status=lobby`,
    );
    expect(screen.getByTestId('live-waiting-rooms-card')).toHaveAttribute(
      'data-empty',
      'false',
    );
  });

  it('explains zero open lobbies and offers create room and play bot', async () => {
    setStats({ ...BASE, waitingRooms: 0 }, Date.now());
    render(<HomeLivePulse />);
    expect(screen.getByText('home.liveLobbiesEmpty')).toBeInTheDocument();
    expect(screen.getByTestId('live-waiting-rooms-action')).toHaveAttribute(
      'href',
      routes.gameCreate,
    );
    fireEvent.click(screen.getByTestId('live-waiting-rooms-bot-action'));
    expect(await screen.findByTestId('game-picker-modal')).toBeInTheDocument();
  });

  it('explains matchmaking when nobody is seeking and offers Quick Match', async () => {
    setStats({ ...BASE, waitingPlayers: 0 }, Date.now());
    render(<HomeLivePulse />);
    expect(screen.getByText('home.liveSeekingEmpty')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('live-waiting-players-action'));
    expect(await screen.findByTestId('game-picker-modal')).toBeInTheDocument();
  });

  it('explains zero active matches and zero matches today with a next step', () => {
    setStats({ ...BASE, activeGames: 0, matchesToday: 0 }, Date.now());
    render(<HomeLivePulse />);
    expect(screen.getByText('home.liveActiveEmpty')).toBeInTheDocument();
    expect(screen.getByText('home.liveTodayEmpty')).toBeInTheDocument();
    expect(screen.getByTestId('live-active-games-action')).toHaveAttribute(
      'href',
      routes.games,
    );
    expect(screen.getByTestId('live-matches-today-action')).toHaveAttribute(
      'href',
      routes.games,
    );
  });

  it('does not claim "nothing is happening" before the first response', () => {
    setStats({ ...BASE, onlineUsers: 0, waitingRooms: 0 }, null);
    render(<HomeLivePulse />);
    expect(screen.getByTestId('live-online-counter')).toHaveTextContent('-');
    expect(screen.queryByText('home.liveLobbiesEmpty')).toBeNull();
    expect(screen.queryByText('home.liveOnlineEmpty')).toBeNull();
    expect(screen.getAllByText('home.liveStatsUnknown').length).toBe(1);
  });

  it('gives every card an action (no arrow-only dead ends)', () => {
    setStats(
      {
        ...BASE,
        onlineUsers: 0,
        activeGames: 0,
        waitingRooms: 0,
        waitingPlayers: 0,
        matchesToday: 0,
      },
      Date.now(),
    );
    render(<HomeLivePulse />);
    for (const id of [
      'live-online-card',
      'live-active-games-card',
      'live-waiting-rooms-card',
      'live-waiting-players-card',
      'live-matches-today-card',
    ]) {
      const card = screen.getByTestId(id);
      expect(card.querySelector('a, button')).not.toBeNull();
    }
  });
});
