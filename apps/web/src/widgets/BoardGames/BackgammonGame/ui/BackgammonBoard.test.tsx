import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackgammonBoard } from './BackgammonBoard';
import type { BackgammonClientState } from '../types';

const mockState: BackgammonClientState = {
  phase: 'roll',
  options: { theme: 'cyberpunk', aiDifficulty: 'medium' },
  points: Array.from({ length: 24 }, (_, i) => {
    if (i === 23) return { playerId: 'p1', count: 2 };
    if (i === 0) return { playerId: 'p2', count: 2 };
    return { playerId: null, count: 0 };
  }),
  bar: { p1: 0, p2: 0 },
  borneOff: { p1: 0, p2: 0 },
  dice: [],
  rolledDice: null,
  currentTurnIndex: 0,
  playerOrder: ['p1', 'p2'],
  players: [
    {
      playerId: 'p1',
      color: 'white',
      alive: true,
      bar: 0,
      borneOff: 0,
      pipCount: 46,
    },
    {
      playerId: 'p2',
      color: 'black',
      alive: true,
      bar: 0,
      borneOff: 0,
      pipCount: 46,
    },
  ],
  winnerId: null,
  isDraw: false,
  logs: [],
};

describe('BackgammonBoard', () => {
  it('renders board and all 24 points', () => {
    render(
      <BackgammonBoard
        currentUserId="p1"
        myTurn={true}
        onMove={vi.fn()}
        onRoll={vi.fn()}
        snapshot={mockState}
      />,
    );

    expect(screen.getByTestId('backgammon-board')).toBeInTheDocument();
    expect(screen.getByTestId('point-0')).toBeInTheDocument();
    expect(screen.getByTestId('point-23')).toBeInTheDocument();
  });

  it('renders roll dice button on my roll turn', () => {
    const handleRoll = vi.fn();
    render(
      <BackgammonBoard
        currentUserId="p1"
        myTurn={true}
        onMove={vi.fn()}
        onRoll={handleRoll}
        snapshot={mockState}
      />,
    );

    const rollBtn = screen.getByTestId('roll-dice-btn');
    expect(rollBtn).toBeInTheDocument();
    fireEvent.click(rollBtn);
    expect(handleRoll).toHaveBeenCalledTimes(1);
  });

  it('allows selecting checker and moving when in move phase', () => {
    const handleMove = vi.fn();
    const moveState: BackgammonClientState = {
      ...mockState,
      phase: 'move',
      dice: [3],
      rolledDice: [3, 0],
    };

    render(
      <BackgammonBoard
        currentUserId="p1"
        myTurn={true}
        onMove={handleMove}
        onRoll={vi.fn()}
        snapshot={moveState}
      />,
    );

    fireEvent.click(screen.getByTestId('point-23'));
    fireEvent.click(screen.getByTestId('point-20'));
    expect(handleMove).toHaveBeenCalledWith({ from: 23, to: 20 });
  });

  it('selects and deselects a checker with keyboard only', () => {
    const moveState: BackgammonClientState = {
      ...mockState,
      phase: 'move',
      dice: [3],
      rolledDice: [3, 0],
    };

    render(
      <BackgammonBoard
        currentUserId="p1"
        myTurn={true}
        onMove={vi.fn()}
        onRoll={vi.fn()}
        snapshot={moveState}
      />,
    );

    // Navigate to point 23 (top-right corner of the nav grid) and select it.
    const grid = screen
      .getByTestId('point-12')
      .closest('[tabindex="0"]') as HTMLElement;
    for (let i = 0; i < 11; i++) {
      fireEvent.keyDown(grid, { key: 'ArrowRight' });
    }
    fireEvent.keyDown(grid, { key: 'Enter' });

    // Selected point 23 offers a legal target at point 20 (23 - 3).
    expect(screen.getByTestId('point-20').textContent).toContain('+3');

    // Escape clears the selection.
    fireEvent.keyDown(grid, { key: 'Escape' });
    expect(screen.getByTestId('point-20').textContent).not.toContain('+3');
  });

  it('exposes bar and bear-off zones as keyboard operable buttons', () => {
    render(
      <BackgammonBoard
        currentUserId="p1"
        myTurn={true}
        onMove={vi.fn()}
        onRoll={vi.fn()}
        snapshot={mockState}
      />,
    );

    for (const zone of ['bar-zone', 'bear-off-zone']) {
      const el = screen.getByTestId(zone);
      expect(el).toHaveAttribute('tabindex', '0');
      expect(el).toHaveAttribute('role', 'button');
    }
  });
});
