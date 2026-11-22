import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SoloGameLanding, type SoloLandingCopy } from '../SoloGameLanding';

vi.mock('@/shared/i18n/useTranslation', async () =>
  (await import('./landingMocks')).translationMock(),
);
vi.mock('../GameLandingLiveStats', () => ({
  GameLandingLiveStats: () => null,
}));
vi.mock('../GameLandingLayout', () => ({
  GameLandingLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const copy: SoloLandingCopy = {
  name: 'Sudoku',
  tagline: 'Logic puzzle',
  heroSubtitle: 'Fill the grid.',
  ctaPlayLabel: 'Play Sudoku',
  facts: [{ label: 'Players', value: '1' }],
  features: [{ icon: '🧩', title: 'Solo', body: 'Play alone' }],
  steps: [{ title: 'Start', body: 'Pick a cell' }],
  rules: [{ label: 'Objective', body: 'Fill digits' }],
  faq: [{ question: 'Q?', answer: 'A.' }],
};

const props = { playHref: '/play', gamesHref: '/games', homeHref: '/' };

describe('SoloGameLanding', () => {
  it('renders nothing without copy', () => {
    const { container } = render(<SoloGameLanding {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders one primary hero action and facts', () => {
    render(<SoloGameLanding {...props} copy={copy} />);
    const hero = screen.getByTestId('solo-landing-hero');
    expect(hero.id).toBe('play');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Sudoku',
    );
    const playLinks = Array.from(hero.querySelectorAll('a')).filter(
      (a) => a.getAttribute('href') === '/play',
    );
    expect(playLinks).toHaveLength(1);
    expect(screen.getByTestId('game-hero-facts')).toHaveTextContent('1');
  });

  it('has no bot or AI vs AI UI', () => {
    render(<SoloGameLanding {...props} copy={copy} />);
    expect(screen.queryByText(/bot/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ai/i, { selector: 'button' })).toBeNull();
  });

  it('orders sections and nav: play, how to play, rules, highlights, faq', () => {
    const { container } = render(<SoloGameLanding {...props} copy={copy} />);
    const ids = Array.from(
      container.querySelectorAll('header[id], section[id]'),
    ).map((el) => el.id);
    expect(ids).toEqual(['play', 'how-to-play', 'rules', 'highlights', 'faq']);
    const hrefs = screen
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'))
      .filter((h): h is string => Boolean(h?.startsWith('#')));
    expect(hrefs).toEqual([
      '#play',
      '#how-to-play',
      '#rules',
      '#highlights',
      '#faq',
    ]);
  });

  it('omits empty sections from nav', () => {
    render(
      <SoloGameLanding
        {...props}
        copy={{ ...copy, faq: [], rules: [], features: [] }}
      />,
    );
    const hrefs = screen
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'))
      .filter((h): h is string => Boolean(h?.startsWith('#')));
    expect(hrefs).toEqual(['#play', '#how-to-play']);
  });
});
