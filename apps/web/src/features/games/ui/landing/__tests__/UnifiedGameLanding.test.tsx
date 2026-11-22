import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UnifiedGameLanding } from '../UnifiedGameLanding';
import type { UnifiedGameLandingProps } from '../types';

vi.mock('@/shared/i18n/useTranslation', async () =>
  (await import('./landingMocks')).translationMock(),
);
vi.mock('@/features/games/ui/QuickplayButton', async () =>
  (await import('./landingMocks')).quickplayButtonMock(),
);
vi.mock('@/features/games/api', async () =>
  (await import('./landingMocks')).gamesApiMock(),
);
vi.mock('../GameLandingLiveStats', () => ({
  GameLandingLiveStats: () => null,
}));
vi.mock('../GameLandingLayout', () => ({
  GameLandingLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock('next/dynamic', () => ({ default: () => () => null }));

const base: UnifiedGameLandingProps = {
  hero: { gameId: 'chess_v1', title: 'Chess', roomsHref: '/rooms' },
  finalCta: {
    gameId: 'chess_v1',
    title: 'Ready?',
    roomsHref: '/rooms',
    gamesHref: '/games',
  },
};

const navHrefs = () =>
  screen
    .getAllByRole('link')
    .map((a) => a.getAttribute('href'))
    .filter((h): h is string => Boolean(h?.startsWith('#')));

describe('UnifiedGameLanding', () => {
  it('renders sections in the documented order with stable ids', () => {
    const { container } = render(
      <UnifiedGameLanding
        {...base}
        faq={{ items: [{ key: 'q', question: 'Q?', answer: 'A.' }] }}
        strategy={{ tips: [{ key: 't', title: 'Tip', body: 'Body' }] }}
        rules={{ rules: [{ key: 'r', head: 'Rule', body: 'Body' }] }}
        howToPlay={{
          steps: [{ key: 's', stepNumber: 1, title: 'Step', body: 'Body' }],
        }}
        highlights={{ items: [{ key: 'h', title: 'High', body: 'Body' }] }}
      />,
    );
    const ids = Array.from(
      container.querySelectorAll('header[id], section[id]'),
    )
      .map((el) => el.id)
      .filter((id) => id.length > 0);
    expect(ids).toEqual([
      'play',
      'how-to-play',
      'rules',
      'highlights',
      'strategy',
      'faq',
    ]);
  });

  it('builds the sticky nav only from present sections', () => {
    render(
      <UnifiedGameLanding
        {...base}
        faq={{ items: [{ key: 'q', question: 'Q?', answer: 'A.' }] }}
        rules={{ rules: [{ key: 'r', head: 'Rule', body: 'Body' }] }}
      />,
    );
    const hrefs = screen
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'))
      .filter((h): h is string => Boolean(h?.startsWith('#')));
    expect(hrefs).toEqual(['#play', '#rules', '#faq']);
  });

  it('appends default-placement extra nav items after Strategy, before FAQ', () => {
    render(
      <UnifiedGameLanding
        {...base}
        extraNavItems={[{ id: 'puzzles', labelKey: 'games.landing.navPlay' }]}
        rules={{ rules: [{ key: 'r', head: 'Rule', body: 'Body' }] }}
        strategy={{ tips: [{ key: 't', title: 'Tip', body: 'Body' }] }}
        faq={{ items: [{ key: 'q', question: 'Q?', answer: 'A.' }] }}
      />,
    );
    expect(navHrefs()).toEqual([
      '#play',
      '#rules',
      '#strategy',
      '#puzzles',
      '#faq',
    ]);
  });

  it('places afterPlay extra nav items right after Play', () => {
    render(
      <UnifiedGameLanding
        {...base}
        extraNavItems={[
          {
            id: 'puzzles',
            labelKey: 'games.landing.navPlay',
            placement: 'afterPlay',
          },
        ]}
        howToPlay={{
          steps: [{ key: 's', stepNumber: 1, title: 'Step', body: 'Body' }],
        }}
        faq={{ items: [{ key: 'q', question: 'Q?', answer: 'A.' }] }}
      />,
    );
    expect(navHrefs()).toEqual(['#play', '#puzzles', '#how-to-play', '#faq']);
  });

  it('still accepts the deprecated quickNavItems prop', () => {
    render(
      <UnifiedGameLanding
        {...base}
        quickNavItems={[{ id: 'x', label: 'X' }]}
      />,
    );
    expect(screen.queryByText('X')).not.toBeInTheDocument();
  });
});
