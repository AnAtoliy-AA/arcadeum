import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameAcademySection } from '../GameAcademySection';

describe('GameAcademySection', () => {
  it('returns null for unknown game key', () => {
    const { container } = render(
      <GameAcademySection gameKey="unknownLanding" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders challenges and allows switching between puzzles', () => {
    render(<GameAcademySection gameKey="ticTacToeLanding" />);

    expect(screen.getByTestId('game-academy-section')).toBeInTheDocument();
    expect(
      screen.getByText('Arcadeum Academy — Interactive Puzzles'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Academy Challenge 1: The Winning Fork'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Puzzle 2'));
    expect(
      screen.getByText('Academy Challenge 2: Defend the Center Trap'),
    ).toBeInTheDocument();
  });
});
