import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AdminStatisticsView } from './AdminStatisticsView';
import { DEFAULT_ADMIN_STATISTICS } from '../server/admin-statistics.server';
import type { AdminStatisticsData } from '../types';

describe('AdminStatisticsView', () => {
  const sampleData: AdminStatisticsData = {
    ...DEFAULT_ADMIN_STATISTICS,
    users: {
      ...DEFAULT_ADMIN_STATISTICS.users,
      totalUsers: 1200,
      dau: 350,
      wau: 850,
      mau: 1100,
      stickinessRate: 31.8,
      newUsersToday: 42,
      roleBreakdown: { free: 1150, admin: 50 },
      countryBreakdown: [{ countryCode: 'US', count: 600, percentage: 50 }],
    },
    games: {
      ...DEFAULT_ADMIN_STATISTICS.games,
      totalGamesPlayed: 5400,
      gamesToday: 320,
      estimatedPlaytimeHours: 675,
      activeRooms: 8,
      waitingRooms: 3,
      byGame: [
        {
          gameId: 'critical_v1',
          totalMatches: 3000,
          matchesToday: 200,
          uniquePlayers: 800,
          registeredMatches: 1800,
          anonymousMatches: 1200,
          registeredPlayers: 500,
          anonymousPlayers: 300,
          wins: 1400,
          losses: 1400,
          draws: 200,
          sharePercentage: 55.6,
        },
      ],
    },
    economy: {
      ...DEFAULT_ADMIN_STATISTICS.economy,
      totalCoinsInCirculation: 50000,
      totalGemsInCirculation: 12000,
      totalArcadeumInCirculation: 300,
      totalPurchasesCount: 45,
      totalPurchasesRevenueUsd: 499.95,
      transactionsCount: 8500,
      transactionsToday: 210,
      transactions7d: 1400,
      reasonsBreakdown: [{ reason: 'faucet', count: 5000, volume: 50000 }],
    },
    tournaments: {
      total: 10,
      liveOrOpen: 2,
      completed: 8,
      totalRegistrations: 64,
    },
    trends: {
      daily: [
        {
          date: '08-24',
          dau: 350,
          registeredDau: 300,
          anonymousDau: 50,
          games: 320,
          registeredGames: 280,
          anonymousGames: 40,
          newUsers: 42,
          transactions: 210,
        },
      ],
      hourlyActivity: [{ hour: 14, count: 45 }],
    },
  };

  it('renders correctly with telemetry and kpi metrics', () => {
    render(<AdminStatisticsView data={sampleData} />);

    expect(screen.getByTestId('admin-statistics-page')).toBeInTheDocument();
    expect(screen.getByTestId('stats-kpi-grid')).toBeInTheDocument();
    expect(screen.getByTestId('stat-dau')).toBeInTheDocument();
    expect(screen.getByTestId('stat-mau')).toBeInTheDocument();
    expect(screen.getByTestId('stat-stickiness')).toBeInTheDocument();
    expect(screen.getByTestId('stat-total-users')).toBeInTheDocument();
    expect(screen.getByTestId('stat-total-games')).toBeInTheDocument();
    expect(screen.getByTestId('stat-revenue')).toBeInTheDocument();

    expect(screen.getByTestId('stats-activity-charts')).toBeInTheDocument();
    expect(
      screen.getByTestId('stats-engagement-retention'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('stats-anonymous-overview')).toBeInTheDocument();
    expect(screen.getByTestId('filter-all-players')).toBeInTheDocument();
    expect(screen.getByTestId('filter-registered-only')).toBeInTheDocument();
    expect(screen.getByTestId('filter-anonymous-only')).toBeInTheDocument();
    expect(screen.getByTestId('export-pdf-button')).toBeInTheDocument();
    expect(screen.getByTestId('stats-games-breakdown')).toBeInTheDocument();
    expect(screen.getByTestId('stats-economy-overview')).toBeInTheDocument();
    expect(
      screen.getByTestId('stats-demographics-overview'),
    ).toBeInTheDocument();
  });
});
