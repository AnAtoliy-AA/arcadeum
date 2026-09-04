import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MinesweeperGame from './Game';
import { useMinesweeperStore } from '../store/minesweeperStore';

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

describe('MinesweeperGame UI', () => {
  beforeEach(() => {
    useMinesweeperStore.getState().newGame();
  });

  it('renders HUD, mine counter, face button, and grid', () => {
    render(<MinesweeperGame />);

    expect(
      screen.getByRole('grid', {
        name: 'games.minesweeper_v1.board.label',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', {
        name: 'games.minesweeper_v1.hud.newGame',
      }).length,
    ).toBeGreaterThan(0);
  });

  it('toggles flag mode on button click', () => {
    render(<MinesweeperGame />);

    const flagBtn = screen.getByRole('button', {
      name: /games\.minesweeper_v1\.hud\.flagMode/i,
    });
    expect(flagBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(flagBtn);
    expect(flagBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('reveals a cell on click', () => {
    render(<MinesweeperGame />);

    const cells = screen.getAllByRole('gridcell');
    expect(cells.length).toBeGreaterThan(0);

    fireEvent.click(cells[0]);
    expect(useMinesweeperStore.getState().startedAt).not.toBeNull();
  });

  it('displays GameResultModal upon victory in Minesweeper', () => {
    useMinesweeperStore.setState({
      finished: {
        won: true,
        durationSeconds: 35,
      },
      finishedAt: Date.now(),
    });

    render(<MinesweeperGame />);

    const modal = screen.getByTestId('game-result-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-tone', 'victory');
    expect(screen.getByTestId('rematch-button')).toBeInTheDocument();
  });

  it('displays GameResultModal upon defeat in Minesweeper', () => {
    useMinesweeperStore.setState({
      finished: {
        won: false,
        durationSeconds: 12,
      },
      finishedAt: Date.now(),
    });

    render(<MinesweeperGame />);

    const modal = screen.getByTestId('game-result-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-tone', 'defeat');
    expect(screen.getByTestId('rematch-button')).toBeInTheDocument();
  });
});
