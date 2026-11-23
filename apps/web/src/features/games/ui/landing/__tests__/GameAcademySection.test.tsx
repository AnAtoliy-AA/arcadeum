import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameAcademySection } from '../GameAcademySection';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
  }),
}));

describe('GameAcademySection', () => {
  it('returns null for unknown game key', () => {
    const { container } = render(
      <GameAcademySection gameKey="unknownLanding" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders translated heading and challenge', () => {
    render(<GameAcademySection gameKey="ticTacToeLanding" />);

    expect(screen.getByTestId('game-academy-section')).toBeInTheDocument();
    expect(screen.getByText('games.landing.academyTitle')).toBeInTheDocument();
    expect(
      screen.getByText('games.landing.academyTttTitle1'),
    ).toBeInTheDocument();
  });

  it('exposes puzzles as tabs and switches between them', () => {
    render(<GameAcademySection gameKey="ticTacToeLanding" />);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    const first = screen.getByTestId('academy-puzzle-tab-1');
    const second = screen.getByTestId('academy-puzzle-tab-2');
    expect(first).toHaveAttribute('aria-selected', 'true');
    expect(second).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(second);
    expect(second).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByText('games.landing.academyTttTitle2'),
    ).toBeInTheDocument();
  });

  it('lets callers override the heading', () => {
    render(
      <GameAcademySection
        gameKey="ticTacToeLanding"
        title="Custom title"
        kicker="Custom kicker"
      />,
    );
    expect(screen.getByText('Custom title')).toBeInTheDocument();
    expect(screen.getByText('Custom kicker')).toBeInTheDocument();
  });
});
