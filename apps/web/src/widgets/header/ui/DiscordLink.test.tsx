import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MobileMenu from './MobileMenu';
import { HeaderInteractive } from './HeaderInteractive';

vi.mock('next/navigation', () => ({
  usePathname: () => '/games',
}));

vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({
    snapshot: { role: 'free', accessToken: 'token' },
    clearTokens: vi.fn(),
  }),
}));

vi.mock('@/entities/session/api/authApi', () => ({
  logoutSession: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
  }),
}));

vi.mock('@/shared/config/useRoutes', () => ({
  useRoutes: () => ({
    home: '/',
    games: '/games',
    rooms: '/rooms',
    leaderboards: '/leaderboards',
    shop: '/shop',
    friends: '/friends',
    chats: '/chats',
    history: '/history',
    stats: '/stats',
    settings: '/settings',
    rewards: '/rewards',
    support: '/support',
    auth: '/auth',
    wallet: '/wallet',
    admin: '/admin',
    battlePass: '/battle-pass',
    referrals: '/referrals',
    terms: '/terms',
    privacy: '/privacy',
    profile: (userId: string) => `/profile/${userId}`,
  }),
}));

vi.mock('@/features/referrals/hooks/useCosmeticBadges', () => ({
  useCosmeticBadges: () => ({ data: [] }),
}));

vi.mock('@/features/pwa/context', () => ({
  usePWAOptional: () => null,
}));

vi.mock('./useHeaderAuth', () => ({
  useHeaderAuth: () => ({
    isAuthenticated: false,
    displayName: null,
    hydrated: true,
  }),
}));

vi.mock('@/shared/hooks/useIsMounted', () => ({
  useIsMounted: () => true,
}));

vi.mock('./LanguagePills', () => ({
  default: () => <div data-testid="language-pills" />,
}));

vi.mock('@/shared/hooks/usePendingFriendRequestCount', () => ({
  usePendingFriendRequestCount: () => 0,
}));

vi.mock('@/shared/lib/socket', () => ({
  getNotificationsSocket: () => ({
    auth: {},
    connected: false,
    connect: vi.fn(),
  }),
}));

vi.mock('./useMobileMenu', () => ({
  useMobileMenu: () => ({ isOpen: false, toggle: vi.fn() }),
}));

vi.mock('@/features/live-stats', () => ({
  LivePulseBadge: () => <div data-testid="live-pulse" />,
  LiveActivityPopover: () => <div data-testid="live-popover" />,
  useLiveStatsWs: vi.fn(),
}));

vi.mock('@/widgets/header/ui/LanguageSwitcher', () => ({
  default: () => <div data-testid="language-switcher" />,
}));

describe('Discord Community Links', () => {
  it('renders mobile menu discord link with target _blank and noopener noreferrer', () => {
    render(<MobileMenu navItems={[]} />);
    const discordLink = screen.getByTestId('mobile-discord-link');
    expect(discordLink).toBeDefined();
    expect(discordLink.getAttribute('href')).toContain('discord');
    expect(discordLink.getAttribute('target')).toBe('_blank');
    expect(discordLink.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders profile dropdown discord link with target _blank and noopener noreferrer', () => {
    render(<HeaderInteractive />);
    expect(screen.queryByTestId('header-discord-link')).toBeNull();
    const discordLink = screen.getByTestId('profile-discord-link');
    expect(discordLink).toBeDefined();
    expect(discordLink.getAttribute('href')).toContain('discord');
    expect(discordLink.getAttribute('target')).toBe('_blank');
    expect(discordLink.getAttribute('rel')).toBe('noopener noreferrer');
  });
});

describe('Leaderboards Navigation', () => {
  it('renders leaderboards link in desktop header navigation', () => {
    render(<HeaderInteractive />);
    const link = screen.getByTestId('nav-leaderboards');
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/leaderboards');
  });

  it('renders leaderboards link in mobile menu with trophy icon', () => {
    render(
      <MobileMenu
        navItems={[{ href: '/leaderboards', label: 'Leaderboards' }]}
      />,
    );
    const link = screen.getByTestId('mobile-nav-leaderboards');
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/leaderboards');
    expect(link.querySelector('svg')).toBeDefined();
  });
});
