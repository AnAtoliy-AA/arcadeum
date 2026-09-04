import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SudokuGame from './Game';
import { useSudokuStore } from '../store/sudokuStore';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/shared/analytics/useTrackSoloGameStarted', () => ({
  useTrackSoloGameStarted: vi.fn(),
}));

vi.mock('@/shared/lib/sound', () => ({
  useSound: () => ({ play: vi.fn() }),
}));

vi.mock('@/shared/hooks/useMediaQuery', () => ({
  useMediaQuery: () => ({ sm: false }),
}));

describe('SudokuGame UI', () => {
  beforeEach(() => {
    useSudokuStore.getState().newGame();
  });

  it('renders HUD, board grid, digit controls, and new game button', () => {
    render(<SudokuGame />);

    expect(screen.getByRole('grid', { name: 'Sudoku' })).toBeInTheDocument();
    expect(screen.getByTestId('sudoku-new-game-button')).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(81);
  });

  it('toggles notes mode when notes button is clicked', () => {
    render(<SudokuGame />);

    const notesBtn = screen.getByRole('button', {
      name: /games\.sudoku_v1\.controls\.notes/i,
    });
    expect(notesBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(notesBtn);
    expect(notesBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('resets the board when clicking New Game button', () => {
    render(<SudokuGame />);

    const newGameBtn = screen.getByTestId('sudoku-new-game-button');
    fireEvent.click(newGameBtn);

    expect(screen.getByRole('grid', { name: 'Sudoku' })).toBeInTheDocument();
  });

  it('displays GameResultModal upon winning Sudoku game', () => {
    useSudokuStore.setState({
      finished: {
        mistakes: 0,
        durationMs: 45000,
      },
      finishedAt: Date.now(),
    });

    render(<SudokuGame />);

    const modal = screen.getByTestId('game-result-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-tone', 'victory');
    expect(screen.getByTestId('rematch-button')).toBeInTheDocument();
  });
});
