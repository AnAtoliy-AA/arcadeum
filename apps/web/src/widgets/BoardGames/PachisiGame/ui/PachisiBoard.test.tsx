import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PachisiBoard } from './PachisiBoard';
import { PachisiThemeProvider } from '../lib/PachisiThemeContext';
import type { PachisiClientState } from '../types';

const mockState: PachisiClientState = {
  phase: 'roll',
  options: { variant: 'adventure', aiDifficulty: 'medium' },
  seats: { p1: 0, p2: 2 },
  tokens: {
    p1: [
      { id: 0, progress: -1 },
      { id: 1, progress: -1 },
      { id: 2, progress: -1 },
      { id: 3, progress: -1 },
    ],
    p2: [
      { id: 0, progress: -1 },
      { id: 1, progress: -1 },
      { id: 2, progress: -1 },
      { id: 3, progress: -1 },
    ],
  },
  die: null,
  consecutiveSixes: 0,
  currentTurnIndex: 0,
  playerOrder: ['p1', 'p2'],
  players: [
    { playerId: 'p1', seat: 0, color: 'red', alive: true },
    { playerId: 'p2', seat: 2, color: 'yellow', alive: true },
  ],
  winnerId: null,
  isDraw: false,
  logs: [],
};

function renderBoard(
  snapshot: PachisiClientState,
  onMove = vi.fn(),
  onRoll = vi.fn(),
) {
  return render(
    <PachisiThemeProvider variant="adventure">
      <PachisiBoard
        currentUserId="p1"
        myTurn={true}
        onMove={onMove}
        onRoll={onRoll}
        snapshot={snapshot}
      />
    </PachisiThemeProvider>,
  );
}

describe('PachisiBoard', () => {
  it('renders the board grid with all 52 track cells', () => {
    renderBoard(mockState);
    expect(screen.getByTestId('pachisi-board')).toBeInTheDocument();
    expect(screen.getByLabelText('cell-0 start-0')).toBeInTheDocument();
    expect(screen.getByLabelText('cell-8 safe-star')).toBeInTheDocument();
    expect(screen.getByLabelText('cell-51')).toBeInTheDocument();
  });

  it('shows the roll button on my roll turn and emits a roll', () => {
    const handleRoll = vi.fn();
    renderBoard(mockState, vi.fn(), handleRoll);
    const rollBtn = screen.getByTestId('pachisi-roll-button');
    fireEvent.click(rollBtn);
    expect(handleRoll).toHaveBeenCalledTimes(1);
  });

  it('hides the roll button when it is not my turn', () => {
    render(
      <PachisiThemeProvider variant="adventure">
        <PachisiBoard
          currentUserId="p1"
          myTurn={false}
          onMove={vi.fn()}
          onRoll={vi.fn()}
          snapshot={mockState}
        />
      </PachisiThemeProvider>,
    );
    expect(screen.queryByTestId('pachisi-roll-button')).toBeNull();
  });

  it('highlights yard tokens after rolling a six and moves on click', () => {
    const handleMove = vi.fn();
    const moveState: PachisiClientState = {
      ...mockState,
      phase: 'move',
      die: 6,
    };
    renderBoard(moveState, handleMove);
    const token = screen.getByTestId('yard-token-0-0');
    fireEvent.click(token);
    expect(handleMove).toHaveBeenCalledWith(0);
  });

  it('does not highlight yard tokens for a non-six roll', () => {
    const handleMove = vi.fn();
    const moveState: PachisiClientState = {
      ...mockState,
      phase: 'move',
      die: 3,
    };
    renderBoard(moveState, handleMove);
    // No legal moves hint appears; clicking a yard token does nothing.
    expect(screen.getByTestId('pachisi-no-moves')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('yard-token-0-0'));
    expect(handleMove).not.toHaveBeenCalled();
  });

  it('renders tokens stacked on track cells with occupancy labels', () => {
    const moveState: PachisiClientState = {
      ...mockState,
      phase: 'move',
      die: 6,
      tokens: {
        p1: [
          { id: 0, progress: 5 },
          { id: 1, progress: -1 },
          { id: 2, progress: -1 },
          { id: 3, progress: -1 },
        ],
        p2: [
          { id: 0, progress: 31 },
          { id: 1, progress: -1 },
          { id: 2, progress: -1 },
          { id: 3, progress: -1 },
        ],
      },
    };
    renderBoard(moveState);
    expect(screen.getAllByTestId('token-cell-0').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('token-cell-2').length).toBeGreaterThan(0);
  });
});
