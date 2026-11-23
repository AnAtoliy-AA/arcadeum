import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PachisiBoard } from './PachisiBoard';
import { PachisiThemeProvider } from '../lib/PachisiThemeContext';
import type { PachisiClientState } from '../types';

function state(over: Partial<PachisiClientState> = {}): PachisiClientState {
  return {
    phase: 'move',
    options: { theme: 'adventure', aiDifficulty: 'medium' },
    seats: { p1: 0, p2: 2 },
    tokens: {
      p1: [
        { id: 0, progress: 3 },
        { id: 1, progress: 10 },
        { id: 2, progress: -1 },
        { id: 3, progress: -1 },
      ],
      p2: [
        // seat 2 start is cell 26; progress 0 -> cell 26 (safe). progress 28 -> cell 2.
        { id: 0, progress: 28 },
        { id: 1, progress: -1 },
        { id: 2, progress: -1 },
        { id: 3, progress: -1 },
      ],
    },
    die: 2,
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
    ...over,
  };
}

function renderBoard(s: PachisiClientState) {
  return render(
    <PachisiThemeProvider variant="adventure">
      <PachisiBoard
        currentUserId="p1"
        myTurn
        onMove={vi.fn()}
        onRoll={vi.fn()}
        snapshot={s}
      />
    </PachisiThemeProvider>,
  );
}

describe('PachisiBoard UX', () => {
  it('exposes the board as a labelled group and renders the legend', () => {
    renderBoard(state());
    expect(screen.getByRole('group', { name: /boardAria/ })).toBe(
      screen.getByTestId('pachisi-board'),
    );
    expect(screen.getByTestId('pachisi-legend')).toBeInTheDocument();
  });

  it('marks destination cells and flags captures', () => {
    renderBoard(state());
    // token 0: 3 -> 5 (plain move), token 1: 10 -> 12
    expect(screen.getByTestId('cell-5')).toHaveAttribute('data-dest', 'move');
    expect(screen.getByTestId('cell-12')).toHaveAttribute('data-dest', 'move');
    expect(screen.getByTestId('cell-6')).not.toHaveAttribute('data-dest');
  });

  it('flags an opponent landing as a capture', () => {
    renderBoard(
      state({
        tokens: {
          p1: [{ id: 0, progress: 0 }],
          p2: [{ id: 0, progress: 28 }],
        },
      }),
    );
    expect(screen.getByTestId('cell-2')).toHaveAttribute(
      'data-dest',
      'capture',
    );
  });

  it('highlights only the hovered token destination strongly', () => {
    renderBoard(state());
    const btn = screen.getByTestId('token-cell-3-0');
    fireEvent.mouseEnter(btn);
    expect(screen.getByTestId('cell-5').className).toContain(
      'pachisi-cell-dest-active',
    );
    expect(screen.getByTestId('cell-12').className).not.toContain(
      'pachisi-cell-dest-active',
    );
    fireEvent.mouseLeave(btn);
    expect(screen.getByTestId('cell-5').className).not.toContain(
      'pachisi-cell-dest-active',
    );
  });

  it('cycles focus between movable tokens with arrow keys, most advanced first', () => {
    renderBoard(state());
    const lead = screen.getByTestId('token-cell-10-1');
    const trail = screen.getByTestId('token-cell-3-0');
    lead.focus();
    fireEvent.keyDown(lead, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(trail);
    fireEvent.keyDown(trail, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(lead);
  });

  it('counter-rotates the stack count', () => {
    renderBoard(
      state({
        tokens: {
          p1: [
            { id: 0, progress: 3 },
            { id: 1, progress: 3 },
            { id: 2, progress: -1 },
            { id: 3, progress: -1 },
          ],
          p2: [{ id: 0, progress: -1 }],
        },
      }),
    );
    expect(screen.getByTestId('stack-count-3').style.transform).toContain(
      'pachisi-counter-rot',
    );
  });
});
