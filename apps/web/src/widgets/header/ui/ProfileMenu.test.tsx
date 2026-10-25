import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfileMenu from './ProfileMenu';

vi.mock('next/navigation', () => ({
  usePathname: () => '/games',
}));

vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({
    snapshot: {
      role: 'free',
      accessToken: 'token',
      userId: 'test-user',
      equippedAvatarId: null,
      equippedBadgeId: null,
      equippedNameColorId: null,
      equippedFrameId: null,
      equippedAuraId: null,
      equippedBannerId: null,
      equippedGameSkinId: null,
    },
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
    profile: (id: string) => `/profile/${id}`,
  }),
}));

vi.mock('./useHeaderAuth', () => ({
  useHeaderAuth: () => ({
    isAuthenticated: false,
    displayName: 'Guest #1234',
    hydrated: true,
  }),
}));

vi.mock('@/features/referrals/hooks/useCosmeticBadges', () => ({
  useCosmeticBadges: () => [],
}));

vi.mock('@/features/shop/hooks/useEquippedCosmetics', () => ({
  useEquippedCosmetics: () => ({
    skinChip: null,
  }),
}));

vi.mock('@/shared/hooks/useMusicSetting', () => ({
  useMusicSetting: () => ({
    musicEnabled: false,
    toggleMusic: vi.fn(),
  }),
}));

vi.mock('@/features/pwa/context', () => ({
  usePWAOptional: () => null,
}));

vi.mock('@/shared/hooks/usePendingFriendRequestCount', () => ({
  usePendingFriendRequestCount: () => 0,
}));

describe('ProfileMenu', () => {
  it('renders trigger button with avatar and username', () => {
    render(<ProfileMenu />);
    const trigger = screen.getByTestId('profile-menu').querySelector('button');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveClass('h-9');
    expect(trigger).toHaveClass('rounded-full');

    const avatar = screen.getByTestId('header-equipped-avatar');
    expect(avatar).toBeInTheDocument();

    const username = screen.getByTestId('header-username');
    expect(username).toBeInTheDocument();
    expect(username).toHaveTextContent('Guest');
  });
});
