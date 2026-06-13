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
  useLocale: () => 'en',
}));

// next/link renders a plain <a> in test environment
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/en',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ locale: 'en' }),
}));

const criticalGame = featuredGames.find((g) => g.id === 'critical_v1')!;
const glimwormGame = featuredGames.find((g) => g.id === 'glimworm_v1')!;
const seaBattleGame = featuredGames.find((g) => g.id === 'sea_battle_v1')!;

const baseProps = {
  game: criticalGame,
  homeCopy: {
    gamePlayButton: 'Play now',
    gameTryDemo: 'Try demo',
    gameComingSoon: 'Coming Soon',
    gameHowToPlay: 'How to play',
    gameMetaPlayers: 'players',
    gameMetaMatch: 'match',
    gameMetaPlayingNow: 'playing now',
    demoBadge: 'Demo',
  },
  onOpenDetails: vi.fn(),
};

describe('HomeGameCard — comingSoon prop', () => {
  it('renders Play now button enabled when comingSoon=false', () => {
    render(<HomeGameCard {...baseProps} comingSoon={false} />);

    const playBtn = screen.getByTestId('game-play-button');
    expect(playBtn).not.toHaveAttribute('aria-disabled', 'true');
    expect(playBtn.getAttribute('href')).not.toBe('#');
    expect(
      screen.queryByTestId('home-game-coming-soon-badge'),
    ).not.toBeInTheDocument();
  });

  it('renders the card disabled with a "Coming soon" badge when comingSoon=true', () => {
    render(<HomeGameCard {...baseProps} comingSoon={true} />);

    const playBtn = screen.getByTestId('game-play-button');
    const href = playBtn.getAttribute('href');
    const ariaDisabled = playBtn.getAttribute('aria-disabled');
    expect(href === '#' || ariaDisabled === 'true').toBe(true);

    const badge = screen.getByTestId('home-game-coming-soon-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toMatch(/coming soon|games\.create\.comingSoon/i);
  });

  it('routes the sea battle play CTA to the locale-prefixed landing page', () => {
    render(<HomeGameCard {...baseProps} game={seaBattleGame} />);

    const playBtn = screen.getByTestId('game-play-button');
    expect(playBtn.getAttribute('href')).toBe('/en/games/sea-battle');
  });

  it('routes the play CTA to game create when no landing href is set', () => {
    render(<HomeGameCard {...baseProps} game={criticalGame} />);

    const playBtn = screen.getByTestId('game-play-button');
    expect(playBtn.getAttribute('href')).toBe(
      '/en/games/create?gameId=critical_v1',
    );
  });

  it('still disables when comingSoon=false but isPlayable=false', () => {
    const nonPlayableGame = { ...criticalGame, isPlayable: false };
    render(
      <HomeGameCard {...baseProps} game={nonPlayableGame} comingSoon={false} />,
    );

    const playBtn = screen.getByTestId('game-play-button');
    expect(playBtn.getAttribute('href')).toBe('#');
  });
});

describe('HomeGameCard — V2 cover-led layout (ARC-747)', () => {
  it('renders the genre · pace pill in the cover', () => {
    render(<HomeGameCard {...baseProps} comingSoon={false} />);

    expect(
      screen.getByText(`${criticalGame.genre} · ${criticalGame.pace}`),
    ).toBeInTheDocument();
  });

  it('renders the meta row with players and duration', () => {
    const { container } = render(
      <HomeGameCard {...baseProps} comingSoon={false} />,
    );

    const meta = container.querySelector('.featured-card-meta-main');
    expect(meta).not.toBeNull();
    expect(meta!.textContent).toContain(criticalGame.players);
    expect(meta!.textContent).toContain('players');
    expect(meta!.textContent).toContain(criticalGame.duration);
    expect(meta!.textContent).toContain('match');
  });

  it('shows the Demo badge with "Try demo" CTA copy for demo games', () => {
    render(<HomeGameCard {...baseProps} game={glimwormGame} />);

    expect(
      screen.getByTestId(`game-demo-badge-${glimwormGame.id}`),
    ).toBeInTheDocument();
    expect(screen.getByTestId('game-play-button').textContent).toMatch(
      /try demo/i,
    );
  });

  it('hides the playing-now meta entry when count is null', () => {
    render(<HomeGameCard {...baseProps} comingSoon={false} />);

    // criticalGame.playingNow is null in the data
    expect(screen.queryByText(/playing now/i)).not.toBeInTheDocument();
  });

  it('shows the playing-now meta entry when count is a number', () => {
    const liveGame = { ...criticalGame, playingNow: 1234 };
    render(<HomeGameCard {...baseProps} game={liveGame} />);

    expect(screen.getByText(/1\.2k/)).toBeInTheDocument();
    expect(screen.getByText(/playing now/i)).toBeInTheDocument();
  });

  it('exposes the help button with an accessible "How to play" label', () => {
    render(<HomeGameCard {...baseProps} />);

    const helpBtn = screen.getByTestId('game-help-button');
    expect(helpBtn).toHaveAccessibleName(/how to play/i);
  });

  it('applies the per-game accent as a CSS variable', () => {
    const { container } = render(<HomeGameCard {...baseProps} />);

    const card = container.querySelector(
      '.featured-card-main',
    ) as HTMLElement | null;
    expect(card).not.toBeNull();
    expect(card!.style.getPropertyValue('--game-accent')).toBe(
      criticalGame.accentColor,
    );
  });
});
