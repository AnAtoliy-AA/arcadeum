import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProfilePageContent from './ProfilePageContent';
import { ApiError } from '@/shared/lib/api-client';

const getUserProfile = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ userId: 'u1' }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params ? `${key}:${Object.values(params).join(',')}` : key,
  }),
}));
vi.mock('@/shared/config/useRoutes', () => ({
  useRoutes: () => ({
    auth: '/auth',
    shopInventory: '/shop/inventory',
    profile: (id: string) => `/profile/${id}`,
  }),
}));
vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({ snapshot: { userId: null, accessToken: null } }),
}));
vi.mock('@/shared/api/profile', () => ({
  getUserProfile: (...a: unknown[]) => getUserProfile(...a),
  getUserFriends: vi.fn().mockResolvedValue([]),
  getUserAchievements: vi.fn().mockResolvedValue([]),
  getUserStats: vi.fn().mockRejectedValue(new Error('x')),
  getUserTrends: vi.fn().mockRejectedValue(new Error('x')),
  getUserHistory: vi.fn().mockResolvedValue({ entries: [] }),
  getHeadToHeadWithUser: vi.fn(),
}));
vi.mock('@/shared/api/friends', () => ({
  sendFriendRequestByUserId: vi.fn(),
  getFriends: vi.fn(),
  getPendingRequests: vi.fn(),
}));
vi.mock('@/shared/ui/PlayerAvatar/EquippedPlayerAvatar', () => ({
  EquippedPlayerAvatar: () => <span />,
}));
vi.mock('@/features/shop/ui/GiftDialog', () => ({ GiftDialog: () => null }));

const profile = {
  displayName: 'Ada',
  username: 'ada',
  role: 'user',
  prestige: 0,
  xp: 10,
};

describe('ProfilePageContent states', () => {
  beforeEach(() => getUserProfile.mockReset());

  it('shows a skeleton while loading, then the profile and empty sections', async () => {
    getUserProfile.mockResolvedValue(profile);
    render(<ProfilePageContent />);
    expect(screen.getByTestId('profile-skeleton')).toBeInTheDocument();
    expect(await screen.findByTestId('profile-hero')).toBeInTheDocument();
    expect(screen.getByTestId('profile-matches-empty')).toBeInTheDocument();
    expect(
      screen.getByText('games.common.profile.noFriends'),
    ).toBeInTheDocument();
  });

  it('shows not found for a 404', async () => {
    getUserProfile.mockImplementationOnce(async () => {
      throw new ApiError('nf', 404);
    });
    render(<ProfilePageContent />);
    expect(
      await screen.findByText('games.common.profile.notFound'),
    ).toBeInTheDocument();
  });

  it('shows an error with retry for other failures and recovers', async () => {
    getUserProfile.mockImplementationOnce(() =>
      Promise.reject(new ApiError('boom', 500)),
    );
    getUserProfile.mockResolvedValueOnce(profile);
    render(<ProfilePageContent />);
    expect(await screen.findByTestId('profile-error')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'games.common.profile.retry' }),
    );
    await waitFor(() =>
      expect(screen.getByTestId('profile-hero')).toBeInTheDocument(),
    );
  });
});
