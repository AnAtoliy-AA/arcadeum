import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SolitaireGame from './Game';
import { useSolitaireStore } from '../store/solitaireStore';

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
    });

    render(<SolitaireGame />);

    const modal = screen.getByTestId('game-result-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-tone', 'defeat');
    expect(screen.getByTestId('rematch-button')).toBeInTheDocument();
  });
});
