import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InteractiveGuideBoard } from '../ui/InteractiveGuideBoard';

describe('InteractiveGuideBoard', () => {
  const defaultProps = {
    id: 'test-challenge',
    title: 'Spot the Fork',
    prompt: 'Play as X to win.',
    gameId: 'tic-tac-toe' as const,
    board: ['X', '', '', '', 'O', '', '', '', 'X'],
    solutionIndex: 2,
    explanation: 'Playing square 3 forks O and forces a win!',
    playHref: '/games/tic-tac-toe',
  };

  it('renders title, prompt, and clickable cells', () => {
    render(<InteractiveGuideBoard {...defaultProps} />);

    expect(screen.getByText('Spot the Fork')).toBeInTheDocument();
    expect(screen.getByText('Play as X to win.')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^puzzle-cell-/)).toHaveLength(9);
  });

  it('handles wrong move with feedback and reset', () => {
    render(<InteractiveGuideBoard {...defaultProps} />);

    fireEvent.click(screen.getByTestId('puzzle-cell-1'));

    expect(screen.getByTestId('puzzle-feedback-incorrect')).toBeInTheDocument();
    expect(
      screen.getByText('Not quite! That leaves an opening.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Try Again'));
    expect(
      screen.queryByTestId('puzzle-feedback-incorrect'),
    ).not.toBeInTheDocument();
  });

  it('handles correct move with celebratory feedback and explanation', () => {
    render(<InteractiveGuideBoard {...defaultProps} />);

    fireEvent.click(screen.getByTestId('puzzle-cell-2'));

    expect(screen.getByTestId('puzzle-feedback-correct')).toBeInTheDocument();
    expect(
      screen.getByText('Playing square 3 forks O and forces a win!'),
    ).toBeInTheDocument();
    expect(screen.getByText('Play Full Game Now')).toBeInTheDocument();
    expect(screen.getByTestId('puzzle-cell-2')).toHaveTextContent('X');
  });
});
