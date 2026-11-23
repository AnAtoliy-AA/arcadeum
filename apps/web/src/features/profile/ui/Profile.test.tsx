import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileHeroCard } from './ProfileHeroCard';
import { ProfileSkeleton } from './ProfileSkeleton';
import { ProfileFriendsList } from './ProfileFriendsList';
import { MatchHistoryFeed } from './MatchHistoryFeed';
import type { PublicUserProfile } from '@/shared/api/profile';
import type { Friend } from '@/shared/api/friends';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params ? `${key}:${Object.values(params).join(',')}` : key,
  }),
}));
vi.mock('@/shared/config/useRoutes', () => ({
  useRoutes: () => ({ profile: (id: string) => `/profile/${id}` }),
}));
vi.mock('@/shared/ui/PlayerAvatar/EquippedPlayerAvatar', () => ({
  EquippedPlayerAvatar: ({ name }: { name: string }) => (
    <span data-testid="avatar">{name}</span>
  ),
}));

const profile = {
  displayName: 'Ada',
  username: 'ada',
  role: 'user',
  prestige: 2,
  xp: 1500,
  countryCode: 'GB',
  createdAt: '2025-01-01T00:00:00.000Z',
} as unknown as PublicUserProfile;

describe('ProfileHeroCard', () => {
  it('renders identity, chips, level and actions', () => {
    render(
      <ProfileHeroCard
        profile={profile}
        actions={<button type="button">act</button>}
      />,
    );
    expect(screen.getByTestId('profile-name')).toHaveTextContent('Ada');
    expect(screen.getByText('@ada')).toBeInTheDocument();
    expect(screen.getByText('PII')).toBeInTheDocument();
    expect(screen.getByText('GB')).toBeInTheDocument();
    expect(screen.getByTestId('profile-level')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'act' })).toBeInTheDocument();
  });

  it('falls back to username and hides optional chips', () => {
    render(
      <ProfileHeroCard
        profile={{
          ...profile,
          displayName: '',
          prestige: 0,
          countryCode: undefined,
          createdAt: undefined,
        }}
      />,
    );
    expect(screen.getByTestId('profile-name')).toHaveTextContent('ada');
    expect(screen.queryByText('GB')).not.toBeInTheDocument();
    expect(screen.queryByText(/profile\.joined/)).not.toBeInTheDocument();
  });
});

describe('ProfileSkeleton', () => {
  it('is an accessible busy status', () => {
    render(<ProfileSkeleton />);
    const el = screen.getByTestId('profile-skeleton');
    expect(el).toHaveAttribute('aria-busy', 'true');
    expect(el).toHaveAttribute('role', 'status');
  });
});

describe('ProfileFriendsList', () => {
  it('shows an empty state without friends', () => {
    render(<ProfileFriendsList friends={[]} />);
    expect(
      screen.getByText('games.common.profile.noFriends'),
    ).toBeInTheDocument();
  });

  it('renders friends as keyboard reachable links', () => {
    const friends = [
      {
        id: 'f1',
        userId: 'u1',
        username: 'bob',
        displayName: 'Bob',
        online: true,
      },
    ] as unknown as Friend[];
    render(<ProfileFriendsList friends={friends} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/profile/u1');
    expect(screen.getByText('games.common.profile.online')).toBeInTheDocument();
  });
});

describe('MatchHistoryFeed', () => {
  it('shows an empty state with no matches', () => {
    render(<MatchHistoryFeed userId="u" matches={[]} />);
    expect(screen.getByTestId('profile-matches-empty')).toBeInTheDocument();
  });
});
