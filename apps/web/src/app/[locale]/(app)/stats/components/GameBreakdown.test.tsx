import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameBreakdown } from './GameBreakdown';
import type { PlayerStats } from '@/features/history/api';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'stats.gameBreakdownTitle': 'Game Breakdown',
        'stats.games': 'Games',
        'stats.game': 'Game',
        'stats.total': 'Total',
        'stats.wins': 'Wins',
        'stats.winRate': 'Win Rate',
      };
      return map[key] ?? key;
    },
  }),
}));

describe('GameBreakdown', () => {
  const mockStats: PlayerStats = {
    userId: 'u1',
    totalGames: 20,
    wins: 10,
    losses: 10,
    draws: 0,
    winRate: 50,
    currentStreak: 2,
    bestStreak: 4,
    byGameType: [
      {
        gameId: 'cat_dash_v1',
        totalGames: 1,
        wins: 0,
        losses: 1,
        draws: 0,
        winRate: 0,
      },
      {
        gameId: 'tic_tac_toe_v1',
        totalGames: 8,
        wins: 0,
        losses: 8,
        draws: 0,
        winRate: 0,
      },
      {
        gameId: 'sea_battle_v1',
        totalGames: 12,
        wins: 10,
        losses: 2,
        draws: 0,
        winRate: 83,
      },
      {
        gameId: 'go_v1',
        totalGames: 3,
        wins: 0,
        losses: 3,
        draws: 0,
        winRate: 0,
      },
      {
        gameId: 'pachisi_v1',
        totalGames: 1,
        wins: 1,
        losses: 0,
        draws: 0,
        winRate: 100,
      },
    ],
  };

  it('renders friendly game titles instead of raw keys', () => {
    render(<GameBreakdown stats={mockStats} loading={false} />);

    expect(screen.getByText('Cat Dash')).toBeInTheDocument();
    expect(screen.queryByText('cat_dash_v1')).not.toBeInTheDocument();

    expect(screen.getByText('Tic-Tac-Toe')).toBeInTheDocument();
    expect(screen.queryByText('tic_tac_toe_v1')).not.toBeInTheDocument();

    expect(screen.getByText('Sea Battle')).toBeInTheDocument();
    expect(screen.queryByText('sea_battle_v1')).not.toBeInTheDocument();

    expect(screen.getByText('Go')).toBeInTheDocument();
    expect(screen.queryByText('go_v1')).not.toBeInTheDocument();

    expect(screen.getByText('Pachisi')).toBeInTheDocument();
    expect(screen.queryByText('pachisi_v1')).not.toBeInTheDocument();
  });

  it('renders null when stats has no game types', () => {
    const { container } = render(
      <GameBreakdown
        stats={{ ...mockStats, byGameType: [] }}
        loading={false}
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});
