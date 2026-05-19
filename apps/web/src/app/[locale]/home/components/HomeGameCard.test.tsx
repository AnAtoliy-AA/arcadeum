import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomeGameCard } from './HomeGameCard';
import { featuredGames } from '../data/games';

// HomeGameCard renders plain HTML elements (no Tamagui) — no TamaguiProvider needed.

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/config/useRoutes', () => ({
  useRoutes: () => ({
    games: '/en/games',
    gameCreate: '/en/games/create',
  }),
}));

// next/link renders a plain <a> in test environment
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/en',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ locale: 'en' }),
}));

const mockGame = featuredGames[0]; // critical_v1

const baseProps = {
  game: mockGame,
  homeCopy: {
    gamePlayButton: 'Play Now',
    gameComingSoon: 'Coming Soon',
  },
  onOpenDetails: vi.fn(),
};

describe('HomeGameCard — comingSoon prop', () => {
  it('renders Play Now button enabled when comingSoon=false', () => {
    render(<HomeGameCard {...baseProps} comingSoon={false} />);

    const playBtn = screen.getByTestId('game-play-button');
    expect(playBtn).not.toHaveAttribute('aria-disabled', 'true');
    // href should point to a real path, not '#'
    expect(playBtn.getAttribute('href')).not.toBe('#');
    // No coming-soon badge
    expect(
      screen.queryByTestId('home-game-coming-soon-badge'),
    ).not.toBeInTheDocument();
  });

  it('renders the card disabled with a "Coming soon" badge when comingSoon=true', () => {
    render(<HomeGameCard {...baseProps} comingSoon={true} />);

    const playBtn = screen.getByTestId('game-play-button');
    // Button should be neutralized: href="#" or aria-disabled
    const href = playBtn.getAttribute('href');
    const ariaDisabled = playBtn.getAttribute('aria-disabled');
    expect(href === '#' || ariaDisabled === 'true').toBe(true);

    // Coming-soon badge must be present.
    // In tests the t() mock returns the key itself ('games.create.comingSoon'),
    // so we verify the badge exists and its text contains either the real phrase
    // or the i18n key that represents it.
    const badge = screen.getByTestId('home-game-coming-soon-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toMatch(/coming soon|games\.create\.comingSoon/i);
  });

  it('still disables when comingSoon=false but isPlayable=false', () => {
    const nonPlayableGame = { ...mockGame, isPlayable: false };
    render(
      <HomeGameCard {...baseProps} game={nonPlayableGame} comingSoon={false} />,
    );

    const playBtn = screen.getByTestId('game-play-button');
    // Original isPlayable=false path — href must be '#'
    expect(playBtn.getAttribute('href')).toBe('#');
  });
});
