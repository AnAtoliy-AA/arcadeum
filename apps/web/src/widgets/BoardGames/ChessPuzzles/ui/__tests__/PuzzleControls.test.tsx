import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PuzzleControls } from '../PuzzleControls';

describe('PuzzleControls', () => {
  it('renders player phase with hint button when onHint provided', () => {
    const onHint = vi.fn();
    render(
      <PuzzleControls
        phase="player"
        rating={1200}
        onNext={vi.fn()}
        onHint={onHint}
      />,
    );

    const hintBtn = screen.getByTestId('puzzle-hint-btn');
    expect(hintBtn).toBeInTheDocument();
    fireEvent.click(hintBtn);
    expect(onHint).toHaveBeenCalledTimes(1);
  });

  it('renders solved phase with next button', () => {
    const onNext = vi.fn();
    render(
      <PuzzleControls
        phase="solved"
        rating={1350}
        ratingChange={15}
        onNext={onNext}
      />,
    );

    expect(screen.getByText('Correct! 🎉')).toBeInTheDocument();
    const nextBtn = screen.getByTestId('puzzle-next-btn');
    fireEvent.click(nextBtn);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('renders failed phase with retry and show solution buttons', () => {
    const onRetry = vi.fn();
    const onShowSolution = vi.fn();
    const onNext = vi.fn();

    render(
      <PuzzleControls
        phase="failed"
        rating={1400}
        onNext={onNext}
        onRetry={onRetry}
        onShowSolution={onShowSolution}
      />,
    );

    expect(screen.getByText('Incorrect : try again')).toBeInTheDocument();

    const retryBtn = screen.getByTestId('puzzle-retry-btn');
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);

    const solutionBtn = screen.getByTestId('puzzle-solution-btn');
    fireEvent.click(solutionBtn);
    expect(onShowSolution).toHaveBeenCalledTimes(1);

    const failedNextBtn = screen.getByTestId('puzzle-failed-next-btn');
    fireEvent.click(failedNextBtn);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
