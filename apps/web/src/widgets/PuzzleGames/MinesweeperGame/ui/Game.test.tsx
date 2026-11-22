import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MinesweeperGame from './Game';
import { useMinesweeperStore } from '../store/minesweeperStore';

vi.mock('@/shared/i18n/useTranslation', () => ({
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

  it('displays safe cells counter and personal best badge', () => {
    useMinesweeperStore.setState({
      personalBests: {
        beginner: 42,
        intermediate: null,
        expert: null,
      },
    });

    render(<MinesweeperGame />);

    expect(screen.getByTestId('minesweeper-safe-left')).toBeInTheDocument();
    expect(screen.getByTestId('minesweeper-personal-best')).toHaveTextContent(
      '42s',
    );
  });

  it('triggers quick restart on pressing R key', () => {
    render(<MinesweeperGame />);

    const cells = screen.getAllByRole('gridcell');
    fireEvent.click(cells[0]);
    expect(useMinesweeperStore.getState().startedAt).not.toBeNull();

    fireEvent.keyDown(window, { key: 'r' });
    expect(useMinesweeperStore.getState().startedAt).toBeNull();
  });

  it('toggles flagless NF mode and ignores flag actions', () => {
    render(<MinesweeperGame />);

    const nfBtn = screen.getByTestId('minesweeper-flagless-button');
    expect(nfBtn).toBeInTheDocument();
    expect(useMinesweeperStore.getState().flaglessMode).toBe(false);

    fireEvent.click(nfBtn);
    expect(useMinesweeperStore.getState().flaglessMode).toBe(true);

    useMinesweeperStore.getState().flag(0);
    expect(useMinesweeperStore.getState().game.cells[0]?.state).toBe('hidden');

    fireEvent.click(nfBtn);
    expect(useMinesweeperStore.getState().flaglessMode).toBe(false);
  });

  it('renders milestone toast on 50% safe cells progress and dismisses on click', () => {
    useMinesweeperStore.setState({
      activeMilestone: 50,
      reachedMilestones: [50],
    });

    render(<MinesweeperGame />);

    const toast = screen.getByTestId('minesweeper-milestone-toast');
    expect(toast).toBeInTheDocument();
    expect(
      screen.getByText('games.minesweeper_v1.milestone.badge_50'),
    ).toBeInTheDocument();

    const dismissBtn = screen.getByTestId('minesweeper-milestone-dismiss');
    fireEvent.click(dismissBtn);
    expect(useMinesweeperStore.getState().activeMilestone).toBeNull();
  });

  it('renders milestone toast on 80% progress with badge and auto-dismisses on animationEnd', () => {
    useMinesweeperStore.setState({
      activeMilestone: 80,
      reachedMilestones: [80],
    });

    render(<MinesweeperGame />);

    const toast = screen.getByTestId('minesweeper-milestone-toast');
    expect(toast).toBeInTheDocument();
    expect(
      screen.getByText('games.minesweeper_v1.milestone.badge_80'),
    ).toBeInTheDocument();

    fireEvent.animationEnd(toast);
    expect(useMinesweeperStore.getState().activeMilestone).toBeNull();
  });
});
