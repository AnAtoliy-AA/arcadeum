import { describe, it, expect, vi } from 'vitest';
import { getChessA11yAnnouncement } from './a11yAnnouncement';
import type { ChessClientState } from '../types';

const t = vi.fn((key: string) => key);

const baseSnapshot = {
  players: [
    { playerId: 'p1', color: 'white', name: 'White' },
    { playerId: 'p2', color: 'black', name: 'Black' },
  ],
  currentTurnColor: 'white',
  isCheck: false,
  isStalemate: false,
  isDrawByRepetition: false,
  isDrawByFiftyMoveRule: false,
  isDrawByAgreement: false,
  winnerColor: null,
} as unknown as ChessClientState;

describe('getChessA11yAnnouncement', () => {
  it('returns undefined while the game is loading', () => {
    expect(
      getChessA11yAnnouncement(null, false, 'p1', (id) => id, t),
    ).toBeUndefined();
  });

  it('announces "your turn" when it is the current user\'s turn', () => {
    const msg = getChessA11yAnnouncement(
      baseSnapshot,
      false,
      'p1',
      (id) => id,
      t,
    );
    expect(msg).toBe('games.chess_v1.status.yourTurn');
  });

  it('announces the opponent turn by name', () => {
    const msg = getChessA11yAnnouncement(
      baseSnapshot,
      false,
      'p2',
      (id) => (id === 'p1' ? 'Alice' : id),
      t,
    );
    expect(msg).toBe('games.chess_v1.status.turn');
    expect(t).toHaveBeenCalledWith('games.chess_v1.status.turn', {
      player: 'Alice',
    });
  });

  it('announces check', () => {
    const msg = getChessA11yAnnouncement(
      { ...baseSnapshot, isCheck: true },
      false,
      'p2',
      (id) => id,
      t,
    );
    expect(msg).toBe('games.chess_v1.status.check');
  });

  it('announces the winner on game over', () => {
    const msg = getChessA11yAnnouncement(
      { ...baseSnapshot, winnerColor: 'white' },
      true,
      'p2',
      (id) => (id === 'p1' ? 'Alice' : id),
      t,
    );
    expect(msg).toBe('games.chess_v1.status.winner');
    expect(t).toHaveBeenCalledWith('games.chess_v1.status.winner', {
      player: 'Alice',
    });
  });

  it('announces a draw on game over', () => {
    const msg = getChessA11yAnnouncement(
      { ...baseSnapshot, isStalemate: true },
      true,
      'p1',
      (id) => id,
      t,
    );
    expect(msg).toBe('games.chess_v1.status.draw');
  });
});
