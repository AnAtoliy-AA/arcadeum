import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameHighlightsGrid } from '../GameHighlightsGrid';
import { GameHowToPlay } from '../GameHowToPlay';
import { GameRulesSection } from '../GameRulesSection';
import { GameFaqSection } from '../GameFaqSection';
import { GameRelatedGames } from '../GameRelatedGames';
import { GameStrategySection } from '../GameStrategySection';

vi.mock('@/shared/i18n/useTranslation', async () =>
  (await import('./landingMocks')).translationMock(),
);

describe('landing sections', () => {
  it('renders nothing for empty data', () => {
    const { container } = render(
      <>
        <GameHighlightsGrid items={[]} />
        <GameHowToPlay steps={[]} />
        <GameRulesSection rules={[]} />
        <GameFaqSection items={[]} />
        <GameStrategySection tips={[]} />
        <GameRelatedGames currentGameSlug="a" games={[]} />
      </>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders how-to steps as an ordered list with an id', () => {
    render(
      <GameHowToPlay
        title="How"
        steps={[
          { key: 'a', stepNumber: 1, title: 'One', body: 'b1', tip: 'tip1' },
          { key: 'b', stepNumber: 2, title: 'Two', body: 'b2' },
        ]}
      />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(document.getElementById('how-to-play')).not.toBeNull();
    expect(screen.getByText('tip1')).toBeInTheDocument();
  });

  it('renders FAQ as details with the first one open', () => {
    render(
      <GameFaqSection
        items={[
          { key: 'a', question: 'Q1', answer: 'A1' },
          { key: 'b', question: 'Q2', answer: 'A2' },
        ]}
      />,
    );
    const details = document.querySelectorAll('details');
    expect(details).toHaveLength(2);
    expect(details[0]).toHaveAttribute('open');
    expect(details[1]).not.toHaveAttribute('open');
  });

  it('numbers rules and shows the note', () => {
    render(
      <GameRulesSection
        rules={[{ key: 'r', head: 'Rule', body: 'Body' }]}
        note="Careful"
      />,
    );
    expect(screen.getByRole('heading', { name: 'Rule' })).toBeInTheDocument();
    expect(screen.getByText('Careful')).toBeInTheDocument();
  });

  it('excludes the current game from the related rail', () => {
    render(
      <GameRelatedGames
        currentGameSlug="chess"
        games={[
          {
            slug: 'chess',
            name: 'Chess',
            category: 'c',
            players: '2',
            description: 'd',
            href: '/chess',
          },
          {
            slug: 'go',
            name: 'Go',
            category: 'c',
            players: '2',
            description: 'd',
            href: '/go',
          },
        ]}
      />,
    );
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/go');
  });

  it('renders highlights as cards', () => {
    render(
      <GameHighlightsGrid
        items={[
          { key: 'a', title: 'A', body: 'x', icon: '★' },
          { key: 'b', title: 'B', body: 'y' },
        ]}
      />,
    );
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });
});
