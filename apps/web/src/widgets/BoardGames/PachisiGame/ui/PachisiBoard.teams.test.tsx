import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PachisiBoard } from './PachisiBoard';
import { PachisiThemeProvider } from '../lib/PachisiThemeContext';
import type { PachisiClientState, PachisiToken } from '../types';

const yard = (n = 4): PachisiToken[] =>
  Array.from({ length: n }, (_, id) => ({ id, progress: -1 }));
const home = (n = 4): PachisiToken[] =>
  Array.from({ length: n }, (_, id) => ({ id, progress: 56 }));

/** p1/p3 are partners (seats 0 and 2), p2/p4 the other team. */
function teamState(overrides: Partial<PachisiClientState> = {}) {
  const state: PachisiClientState = {
    phase: 'move',
    options: { theme: 'adventure', teams: true },
    seats: { p1: 0, p2: 1, p3: 2, p4: 3 },
    tokens: { p1: yard(), p2: yard(), p3: yard(), p4: yard() },
    die: 6,
    consecutiveSixes: 0,
    currentTurnIndex: 0,
    playerOrder: ['p1', 'p2', 'p3', 'p4'],
    players: [
      { playerId: 'p1', seat: 0, color: 'red', alive: true, team: 0 },
      { playerId: 'p2', seat: 1, color: 'green', alive: true, team: 1 },
      { playerId: 'p3', seat: 2, color: 'yellow', alive: true, team: 0 },
      { playerId: 'p4', seat: 3, color: 'blue', alive: true, team: 1 },
    ],
    winnerId: null,
    isDraw: false,
    teamMode: true,
    winnerTeam: null,
    logs: [],
    ...overrides,
  };
  return state;
}

function renderBoard(snapshot: PachisiClientState, onMove = vi.fn()) {
  render(
    <PachisiThemeProvider variant="adventure">
      <PachisiBoard
        currentUserId="p1"
        myTurn
        onMove={onMove}
        onRoll={vi.fn()}
        snapshot={snapshot}
      />
    </PachisiThemeProvider>,
  );
  return onMove;
}

describe('PachisiBoard team mode', () => {
  it('labels each yard with its team and marks you and your partner', () => {
    renderBoard(teamState());
    expect(screen.getByTestId('pachisi-yard-team-0')).toHaveTextContent(
      'games.pachisi_v1.game.team.label',
    );
    expect(screen.getByTestId('pachisi-yard-team-0')).toHaveTextContent(
      'games.pachisi_v1.game.team.you',
    );
    expect(screen.getByTestId('pachisi-yard-team-2')).toHaveTextContent(
      'games.pachisi_v1.game.team.partner',
    );
    expect(screen.getByTestId('pachisi-yard-team-1')).not.toHaveTextContent(
      'games.pachisi_v1.game.team.partner',
    );
    expect(screen.getByTestId('pachisi-team-chip-p3')).toBeInTheDocument();
  });

  it('shows no team UI when teams are off', () => {
    renderBoard(
      teamState({
        teamMode: false,
        players: teamState().players.map((p) => ({ ...p, team: undefined })),
      }),
    );
    expect(screen.queryByTestId('pachisi-yard-team-0')).toBeNull();
    expect(screen.queryByTestId('pachisi-team-chip-p3')).toBeNull();
  });

  it('moves your own token without an owner while you still have tokens', () => {
    const onMove = renderBoard(teamState());
    fireEvent.click(screen.getByTestId('yard-token-0-0'));
    expect(onMove).toHaveBeenCalledWith(0);
    // The partner's tokens are not clickable yet.
    fireEvent.click(screen.getByTestId('yard-token-2-0'));
    expect(onMove).toHaveBeenCalledTimes(1);
  });

  it('once finished, you move the partner tokens and the owner is sent', () => {
    const state = teamState({
      tokens: { p1: home(), p2: yard(), p3: yard(), p4: yard() },
    });
    const onMove = renderBoard(state);
    expect(
      screen.getByTestId('pachisi-moving-partner-badge'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('yard-token-2-1')).toHaveAttribute(
      'data-partner',
      'true',
    );
    fireEvent.click(screen.getByTestId('yard-token-2-1'));
    expect(onMove).toHaveBeenCalledWith(1, 'p3');
    // Opponent tokens are never movable.
    fireEvent.click(screen.getByTestId('yard-token-1-0'));
    expect(onMove).toHaveBeenCalledTimes(1);
  });
});
