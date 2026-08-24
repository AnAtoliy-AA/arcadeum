import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdminDashboardView } from './AdminDashboardView';
import type { AdminDashboardData } from '../types';

describe('AdminDashboardView', () => {
  const mockData: AdminDashboardData = {
    healthy: true,
    pingOk: true,
    dbHealth: {
      database: 'arcadeum_production',
      totalDocs: 15420,
      dataSizeMB: 12.5,
      storageSizeMB: 28.4,
      indexSizeMB: 4.1,
      collections: 8,
      details: {
        users: { count: 1200, sizeMB: 2.1, avgObjBytes: 512, indexes: 3 },
        tournaments: { count: 45, sizeMB: 0.8, avgObjBytes: 256, indexes: 2 },
      },
    },
  };

  it('renders command center title and status', () => {
    render(<AdminDashboardView data={mockData} />);

    expect(screen.getByText('Command Center')).toBeInTheDocument();
    expect(screen.getByText('Operational')).toBeInTheDocument();
    expect(screen.getByText('DB: arcadeum_production')).toBeInTheDocument();
  });

  it('renders stat tiles with database metrics', () => {
    render(<AdminDashboardView data={mockData} />);

    expect(screen.getByTestId('stat-total-documents')).toBeInTheDocument();
    expect(screen.getByTestId('stat-storage-size')).toBeInTheDocument();
    expect(screen.getByTestId('stat-collections')).toBeInTheDocument();
    expect(screen.getByTestId('stat-active-modules')).toBeInTheDocument();
  });

  it('renders all administrative module cards with correct links', () => {
    render(<AdminDashboardView data={mockData} />);

    expect(screen.getByTestId('module-card-users')).toHaveAttribute(
      'href',
      '/admin/users',
    );
    expect(screen.getByTestId('module-card-payments')).toHaveAttribute(
      'href',
      '/admin/payments',
    );
    expect(screen.getByTestId('module-card-tournaments')).toHaveAttribute(
      'href',
      '/admin/tournaments',
    );
    expect(screen.getByTestId('module-card-gemPackages')).toHaveAttribute(
      'href',
      '/admin/gem-packages',
    );
    expect(screen.getByTestId('module-card-shop')).toHaveAttribute(
      'href',
      '/admin/shop',
    );
    expect(screen.getByTestId('module-card-economy')).toHaveAttribute(
      'href',
      '/admin/economy',
    );
    expect(screen.getByTestId('module-card-bulkRewards')).toHaveAttribute(
      'href',
      '/admin/bulk-rewards',
    );
    expect(screen.getByTestId('module-card-games')).toHaveAttribute(
      'href',
      '/admin/games',
    );
    expect(screen.getByTestId('module-card-gameRules')).toHaveAttribute(
      'href',
      '/admin/game-rules',
    );
    expect(screen.getByTestId('module-card-announcements')).toHaveAttribute(
      'href',
      '/admin/announcements',
    );
    expect(screen.getByTestId('module-card-blockedIps')).toHaveAttribute(
      'href',
      '/admin/blocked-ips',
    );
    expect(screen.getByTestId('module-card-geoBlock')).toHaveAttribute(
      'href',
      '/admin/geo-block',
    );
  });

  it('renders collections breakdown table when details are present', () => {
    render(<AdminDashboardView data={mockData} />);

    expect(screen.getByTestId('admin-collections-table')).toBeInTheDocument();
    expect(screen.getByText('users')).toBeInTheDocument();
    expect(screen.getByText('tournaments')).toBeInTheDocument();
  });

  it('renders degraded state when ping or health fails', () => {
    const degradedData: AdminDashboardData = {
      healthy: false,
      pingOk: false,
      dbHealth: null,
    };

    render(<AdminDashboardView data={degradedData} />);

    expect(screen.getByText('Degraded')).toBeInTheDocument();
  });
});
