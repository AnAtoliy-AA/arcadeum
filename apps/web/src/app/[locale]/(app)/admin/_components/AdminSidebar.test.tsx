import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminSidebar, type AdminSidebarLabels } from './AdminSidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/users',
}));

describe('AdminSidebar', () => {
  const mockLabels: AdminSidebarLabels = {
    items: {
      dashboard: 'Dashboard',
      users: 'Users',
      payments: 'Payments',
      tournaments: 'Tournaments',
      economy: 'Economy',
      gemPackages: 'Gem Packages',
      shop: 'Shop',
      bulkRewards: 'Bulk Rewards',
      games: 'Games',
      gameRules: 'Game Rules',
      announcements: 'Announcements',
      blockedIps: 'Blocked IPs',
      geoBlock: 'Geo-Blocking',
    },
    comingSoon: 'Coming soon',
  };

  it('renders all admin navigation links', () => {
    render(<AdminSidebar labels={mockLabels} />);

    expect(screen.getByTestId('admin-nav-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('admin-nav-users')).toBeInTheDocument();
    expect(screen.getByTestId('admin-nav-payments')).toBeInTheDocument();
    expect(screen.getByTestId('admin-nav-tournaments')).toBeInTheDocument();
    expect(screen.getByTestId('admin-nav-gemPackages')).toBeInTheDocument();
    expect(screen.getByTestId('admin-nav-geoBlock')).toBeInTheDocument();
  });

  it('marks active navigation item according to pathname', () => {
    render(<AdminSidebar labels={mockLabels} />);

    const usersNav = screen.getByTestId('admin-nav-users');
    expect(usersNav).toHaveAttribute('data-active', 'true');

    const dashboardNav = screen.getByTestId('admin-nav-dashboard');
    expect(dashboardNav).not.toHaveAttribute('data-active');
  });
});
