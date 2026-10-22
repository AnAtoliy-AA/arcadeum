import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PachisiBoard } from './PachisiBoard';
import { PachisiThemeProvider } from '../lib/PachisiThemeContext';
import type { PachisiClientState } from '../types';

const baseMockState: PachisiClientState = {
  phase: 'roll',
  options: { theme: 'adventure', aiDifficulty: 'medium' },
  seats: { p1: 0, p2: 2 },
  tokens: {
    p1: [
      { id: 0, progress: 0 },
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
  consecutiveSixes: 1,
  currentTurnIndex: 0,
  playerOrder: ['p1', 'p2'],
  players: [
    { playerId: 'p1', seat: 0, color: 'red', alive: true },
    { playerId: 'p2', seat: 2, color: 'yellow', alive: true },
  ],
  winnerId: null,
  isDraw: false,
  logs: [
    {
      id: 'log-1',
      type: 'action',
      message: 'Player rolled a 4.',
      createdAt: new Date().toISOString(),
      senderId: 'p2',
    },
    {
      id: 'log-2',
      type: 'action',
      message: 'Player rolled a 6.',
      createdAt: new Date().toISOString(),
      senderId: 'p1',
    },
    {
      id: 'log-3',
      type: 'action',
      message: 'Move at (0, 0) Moved token to position 0.',
      createdAt: new Date().toISOString(),
      senderId: 'p1',
    },
  ],
};

describe('PachisiBoard bonus roll after six', () => {
  it('retains 6 and shows extra roll banner instead of opponent previous die', () => {
    const extraRollState: PachisiClientState = {
      ...baseMockState,
      phase: 'roll',
      die: null,
      lastDie: 6,
      lastRollerId: 'p1',
      consecutiveSixes: 1,
    };

    render(
      <PachisiThemeProvider variant="adventure">
        <PachisiBoard
          currentUserId="p1"
          myTurn={true}
          onMove={vi.fn()}
          onRoll={vi.fn()}
          snapshot={extraRollState}
        />
      </PachisiThemeProvider>,
    );

    expect(screen.getByTestId('pachisi-extra-roll-badge')).toBeInTheDocument();
    const hint = screen.getByTestId('pachisi-previous-roll-hint');
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveTextContent('6');
    expect(hint).not.toHaveTextContent('4');

    const lastRoll = screen.getByTestId('pachisi-status-last-roll');
    expect(lastRoll).toHaveTextContent('6');
  });

  it('guarantees 6 when consecutiveSixes is greater than zero even without lastDie set', () => {
    const extraRollStateWithoutLastDie: PachisiClientState = {
      ...baseMockState,
      phase: 'roll',
      die: null,
      lastDie: null,
      lastRollerId: null,
      consecutiveSixes: 1,
    };

    render(
      <PachisiThemeProvider variant="adventure">
        <PachisiBoard
          currentUserId="p1"
          myTurn={true}
          onMove={vi.fn()}
          onRoll={vi.fn()}
          snapshot={extraRollStateWithoutLastDie}
        />
      </PachisiThemeProvider>,
    );

    expect(screen.getByTestId('pachisi-extra-roll-badge')).toBeInTheDocument();
    const hint = screen.getByTestId('pachisi-previous-roll-hint');
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveTextContent('6');
  });
});
