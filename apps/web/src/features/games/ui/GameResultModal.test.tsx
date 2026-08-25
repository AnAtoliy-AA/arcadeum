import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameResultModal } from './GameResultModal';

vi.mock('@/shared/lib/sound', () => ({
  useSound: () => ({ play: vi.fn() }),
}));

vi.mock('@/shared/hooks/useMediaQuery', () => ({
  useMediaQuery: () => ({ sm: false }),
}));

const mockT = (key: string) => key;

describe('GameResultModal', () => {
  it('renders victory state with title, gameName, theme and celebration', () => {
    render(
      <GameResultModal
        isOpen={true}
        result="victory"
        gameName="Chess"
        theme="cyberpunk"
        t={mockT}
      />,
    );

    const modal = screen.getByTestId('game-result-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-theme', 'cyberpunk');
    expect(modal).toHaveAttribute('data-tone', 'victory');
    expect(screen.getByText('Chess')).toBeInTheDocument();
    expect(screen.getByTestId('game-result-title')).toBeInTheDocument();
    expect(screen.getByTestId('victory-celebration')).toBeInTheDocument();
  });

  it('renders stats grid when stats prop is provided', () => {
    render(
      <GameResultModal
        isOpen={true}
        result="victory"
        theme="underwater"
        stats={{
          duration: 120,
          turns: 24,
          score: 500,
        }}
        t={mockT}
      />,
    );

    expect(screen.getByTestId('game-result-stats-grid')).toBeInTheDocument();
    expect(screen.getByText('2:00')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('triggers onRematch and onClose callbacks', () => {
    const handleRematch = vi.fn();
    const handleClose = vi.fn();

    render(
      <GameResultModal
        isOpen={true}
        result="defeat"
        onRematch={handleRematch}
        onClose={handleClose}
        t={mockT}
      />,
    );

    fireEvent.click(screen.getByTestId('rematch-button'));
    expect(handleRematch).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('modal-close-button'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('hides summary stats grid when detailed analysis is active', () => {
    render(
      <GameResultModal
        isOpen={true}
        result="victory"
        stats={{ turns: 10, score: 100 }}
        analysis={{
          content: (
            <div data-testid="detailed-analysis-content">Analytics Content</div>
          ),
          viewLabel: 'View Analysis',
          backLabel: 'Back to Result',
        }}
        t={mockT}
      />,
    );

    expect(screen.getByTestId('game-result-stats-grid')).toBeInTheDocument();
    expect(
      screen.queryByTestId('detailed-analysis-content'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('View Analysis'));

    expect(
      screen.queryByTestId('game-result-stats-grid'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('detailed-analysis-content')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Back to Result'));

    expect(screen.getByTestId('game-result-stats-grid')).toBeInTheDocument();
    expect(
      screen.queryByTestId('detailed-analysis-content'),
    ).not.toBeInTheDocument();
  });
});
