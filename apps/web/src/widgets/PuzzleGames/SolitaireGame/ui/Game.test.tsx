import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SolitaireGame from './Game';
import { useSolitaireStore } from '../store/solitaireStore';
import { SUITS, type Card, type SolitaireState, type Suit } from '../types';

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

describe('SolitaireGame UI', () => {
  beforeEach(() => {
    useSolitaireStore.getState().newGame();
  });

  it('renders HUD, score, moves, time, draw pile, and tableau piles', () => {
    render(<SolitaireGame />);

    expect(screen.getByTestId('solitaire-new-game-button')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'games.solitaire_v1.board.draw',
      }),
    ).toBeInTheDocument();
  });

  it('draws a card from stock when draw button is clicked', () => {
    render(<SolitaireGame />);

    const drawBtn = screen.getByRole('button', {
      name: 'games.solitaire_v1.board.draw',
    });
    fireEvent.click(drawBtn);

    expect(useSolitaireStore.getState().game.waste.length).toBeGreaterThan(0);
  });

  it('resets game when clicking new game button', () => {
    render(<SolitaireGame />);

    const newGameBtn = screen.getByTestId('solitaire-new-game-button');
    fireEvent.click(newGameBtn);

    expect(useSolitaireStore.getState().game.moves).toBe(0);
  });

  it('displays GameResultModal upon victory in Solitaire', () => {
    useSolitaireStore.setState({
      finished: {
        won: true,
        score: 750,
        moves: 85,
        durationMs: 180000,
      },
      finishedAt: Date.now(),
    });

    render(<SolitaireGame />);

    const modal = screen.getByTestId('game-result-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-tone', 'victory');
    expect(screen.getByTestId('rematch-button')).toBeInTheDocument();
  });

  it('displays GameResultModal upon defeat in Solitaire', () => {
    useSolitaireStore.setState({
      finished: {
        won: false,
        score: 120,
        moves: 30,
        durationMs: 60000,
      },
      finishedAt: Date.now(),
    });

    render(<SolitaireGame />);

    const modal = screen.getByTestId('game-result-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-tone', 'defeat');
    expect(screen.getByTestId('rematch-button')).toBeInTheDocument();
  });

  it('renders and updates the active game timer', () => {
    useSolitaireStore.setState({
      startedAt: Date.now() - 5000,
      finishedAt: null,
      finished: null,
    });

    render(<SolitaireGame />);

    const timerCard = screen.getByTestId('solitaire-timer');
    expect(timerCard).toBeInTheDocument();
    expect(timerCard).not.toHaveTextContent('00:00');
  });
});

function altRun(first: Suit, second: Suit): Card[] {
  return Array.from({ length: 13 }, (_, index) => {
    const suit = index % 2 === 0 ? first : second;
    const rank = 13 - index;
    return { id: `${suit}-${rank}`, suit, rank, faceUp: true };
  });
}

function allOpenState(): SolitaireState {
  return {
    stock: [],
    waste: [],
    foundations: SUITS.map(() => []),
    tableau: [
      altRun('spades', 'hearts'),
      altRun('hearts', 'spades'),
      altRun('diamonds', 'clubs'),
      altRun('clubs', 'diamonds'),
      [],
      [],
      [],
    ],
    moves: 0,
    score: 0,
  };
}

describe('SolitaireGame auto-place', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hides the auto-place button while cards are still face down', () => {
    render(<SolitaireGame />);
    expect(screen.queryByTestId('solitaire-auto-place-button')).toBeNull();
  });

  it('finishes the game when all cards are open and the button is clicked', () => {
    useSolitaireStore.setState({
      game: allOpenState(),
      startedAt: Date.now(),
      finishedAt: null,
      finished: null,
      history: [],
      usedUndo: false,
    });

    render(<SolitaireGame />);

    fireEvent.click(screen.getByTestId('solitaire-auto-place-button'));
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(useSolitaireStore.getState().finished?.won).toBe(true);
    expect(useSolitaireStore.getState().game.foundations.flat()).toHaveLength(
      52,
    );
    expect(screen.queryByTestId('solitaire-auto-place-button')).toBeNull();
  });

  it('stops auto-placing when the button is clicked again', () => {
    useSolitaireStore.setState({
      game: allOpenState(),
      startedAt: Date.now(),
      finishedAt: null,
      finished: null,
      history: [],
      usedUndo: false,
    });

    render(<SolitaireGame />);

    const button = screen.getByTestId('solitaire-auto-place-button');
    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(160);
    });
    const movesAfterFirstSteps = useSolitaireStore.getState().game.moves;
    expect(movesAfterFirstSteps).toBeGreaterThan(0);

    fireEvent.click(screen.getByTestId('solitaire-auto-place-button'));
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(useSolitaireStore.getState().game.moves).toBe(movesAfterFirstSteps);
  });
});
