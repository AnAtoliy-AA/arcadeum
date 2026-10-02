import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Game2048 from './Game';
import { useGame2048Store } from '../store/game2048Store';

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

describe('Game2048 UI', () => {
  beforeEach(() => {
    useGame2048Store.getState().newGame();
  });

  it('renders HUD, score counters, new game button, and board grid', () => {
    render(<Game2048 />);

    expect(screen.getByTestId('game-2048-score')).toBeInTheDocument();
    expect(screen.getByTestId('game-2048-best')).toBeInTheDocument();
    expect(screen.getByTestId('game-2048-timer')).toBeInTheDocument();
    expect(screen.getByTestId('game-2048-new-game-button')).toBeInTheDocument();
    expect(screen.getByTestId('game-2048-board')).toBeInTheDocument();
  });

  it('resets the board when clicking New Game button', () => {
    render(<Game2048 />);

    const newGameBtn = screen.getByTestId('game-2048-new-game-button');
    fireEvent.click(newGameBtn);

    expect(screen.getByTestId('game-2048-board')).toBeInTheDocument();
    expect(useGame2048Store.getState().score).toBe(0);
  });

  it('shows GameResultModal when game finishes as victory with finish and continue buttons', () => {
    useGame2048Store.setState({
      finished: {
        won: true,
        score: 20480,
        moves: 950,
        durationMs: 120000,
      },
      finishedAt: Date.now(),
      status: 'won',
      keepPlayingFlag: false,
    });

    render(<Game2048 />);

    const modal = screen.getByTestId('game-result-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-tone', 'victory');
    expect(screen.getByTestId('continue-button')).toBeInTheDocument();
    expect(screen.getByTestId('finish-button')).toBeInTheDocument();
  });

  it('resets board when finish button is clicked on win modal', () => {
    useGame2048Store.setState({
      finished: {
        won: true,
        score: 20480,
        moves: 950,
        durationMs: 120000,
      },
      finishedAt: Date.now(),
      status: 'won',
      keepPlayingFlag: false,
    });

    render(<Game2048 />);

    const finishBtn = screen.getByTestId('finish-button');
    expect(finishBtn).toBeInTheDocument();
    fireEvent.click(finishBtn);

    expect(useGame2048Store.getState().score).toBe(0);
    expect(useGame2048Store.getState().finishedAt).toBeNull();
    expect(useGame2048Store.getState().status).toBe('playing');
  });

  it('shows GameResultModal when game finishes as defeat', () => {
    useGame2048Store.setState({
      finished: {
        won: false,
        score: 512,
        moves: 120,
        durationMs: 45000,
      },
      finishedAt: Date.now(),
      status: 'lost',
    });

    render(<Game2048 />);

    const modal = screen.getByTestId('game-result-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-tone', 'defeat');
    expect(screen.queryByTestId('continue-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('rematch-button')).toBeInTheDocument();
  });

  it('continues playing after win without re-triggering win modal on subsequent moves', () => {
    useGame2048Store.setState({
      status: 'won',
      keepPlayingFlag: false,
      grid: [2048, 2, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      finished: {
        won: true,
        score: 2048,
        moves: 50,
        durationMs: 30000,
      },
      finishedAt: Date.now(),
    });

    const { rerender } = render(<Game2048 />);

    const continueBtn = screen.getByTestId('continue-button');
    expect(continueBtn).toBeInTheDocument();
    fireEvent.click(continueBtn);

    expect(useGame2048Store.getState().keepPlayingFlag).toBe(true);
    expect(useGame2048Store.getState().finishedAt).toBeNull();
    expect(useGame2048Store.getState().finished).toBeNull();

    rerender(<Game2048 />);
    expect(screen.queryByTestId('game-result-modal')).not.toBeInTheDocument();

    act(() => {
      useGame2048Store.getState().move('down');
    });

    expect(useGame2048Store.getState().finishedAt).toBeNull();
    expect(useGame2048Store.getState().finished).toBeNull();

    rerender(<Game2048 />);
    expect(screen.queryByTestId('game-result-modal')).not.toBeInTheDocument();
  });

  it('blocks moves while win modal is displayed until continue is clicked', () => {
    useGame2048Store.setState({
      grid: [1024, 1024, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      score: 1024,
      status: 'playing',
      keepPlayingFlag: false,
      finishedAt: null,
      finished: null,
    });

    act(() => {
      useGame2048Store.getState().move('left');
    });

    expect(useGame2048Store.getState().status).toBe('won');
    expect(useGame2048Store.getState().finishedAt).not.toBeNull();
    expect(useGame2048Store.getState().keepPlayingFlag).toBe(false);

    const gridBefore = [...useGame2048Store.getState().grid];

    act(() => {
      useGame2048Store.getState().move('down');
    });

    expect(useGame2048Store.getState().grid).toEqual(gridBefore);
    expect(useGame2048Store.getState().status).toBe('won');
    expect(useGame2048Store.getState().finishedAt).not.toBeNull();

    act(() => {
      useGame2048Store.getState().continuePlaying();
    });

    expect(useGame2048Store.getState().keepPlayingFlag).toBe(true);
    expect(useGame2048Store.getState().finishedAt).toBeNull();
  });

  it('triggers slide on touchmove without waiting for touchend', () => {
    useGame2048Store.setState({
      grid: [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      score: 0,
      moves: 0,
    });

    render(<Game2048 />);

    const board = screen.getByTestId('game-2048-board');

    fireEvent.touchStart(board, {
      touches: [{ clientX: 100, clientY: 100 }],
    });

    fireEvent.touchMove(board, {
      touches: [{ clientX: 50, clientY: 100 }],
    });

    expect(useGame2048Store.getState().moves).toBe(1);
    expect(useGame2048Store.getState().score).toBe(4);
  });
});
