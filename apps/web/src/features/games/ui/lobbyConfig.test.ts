import { describe, it, expect, vi } from 'vitest';
import {
  buildBotLabels,
  buildTableLabels,
  buildTableRoomInfoLabels,
  getDefaultSubtitle,
  getFieldSizeBadge,
  initialBotCount,
  pickBotOptions,
  resolveLobbyConfig,
  shouldStartWithBots,
  withBotDifficulty,
  withDifficultyDefault,
} from './lobbyConfig';

describe('resolveLobbyConfig', () => {
  it('applies defaults when nothing is given', () => {
    const r = resolveLobbyConfig({});
    expect(r).toMatchObject({
      gameName: '',
      roomIcon: '🎲',
      minPlayers: 2,
      enableBots: false,
      showDifficulty: true,
      showFullscreenButton: true,
      showReorderControls: true,
      showInvitedPlayers: true,
    });
    expect(r.maxPlayers).toBeUndefined();
  });

  it('reads values from config', () => {
    const r = resolveLobbyConfig({
      config: {
        gameName: 'Go',
        gameIcon: '⚫',
        seats: { min: 2, max: 2 },
        bots: { enabled: true, showDifficulty: false },
        display: { showInvitedPlayers: false },
      },
    });
    expect(r).toMatchObject({
      gameName: 'Go',
      gameIcon: '⚫',
      maxPlayers: 2,
      enableBots: true,
      showDifficulty: false,
      showInvitedPlayers: false,
    });
  });

  it('lets flat props override config', () => {
    const r = resolveLobbyConfig({
      config: { gameName: 'A', gameIcon: 'a', bots: { enabled: true } },
      gameName: 'B',
      enableBots: false,
      minPlayers: 3,
    });
    expect(r.gameName).toBe('B');
    expect(r.enableBots).toBe(false);
    expect(r.minPlayers).toBe(3);
  });
});

describe('start rules', () => {
  it('computes the initial bot count within seat limits', () => {
    expect(initialBotCount(2, 2)).toBe(1);
    expect(initialBotCount(4, 6)).toBe(3);
    expect(initialBotCount(4, 3)).toBe(2);
    expect(initialBotCount(1, 1)).toBe(1);
  });

  it('starts with bots only for a solo host with bots enabled', () => {
    expect(shouldStartWithBots(true, 1)).toBe(true);
    expect(shouldStartWithBots(true, 2)).toBe(false);
    expect(shouldStartWithBots(false, 1)).toBe(false);
  });

  it('derives the default subtitle', () => {
    const base = {
      status: 'lobby',
      enableBots: false,
      playerCount: 2,
      minPlayers: 2,
      isHost: true,
    };
    expect(getDefaultSubtitle({ ...base, status: 'in_progress' })).toBe(
      'Loading...',
    );
    expect(
      getDefaultSubtitle({ ...base, enableBots: true, playerCount: 1 }),
    ).toBe('Single player mode available');
    expect(getDefaultSubtitle({ ...base, playerCount: 1 })).toBe(
      'Need at least 2 players',
    );
    expect(getDefaultSubtitle(base)).toBe("Click 'Start Game' when ready");
    expect(getDefaultSubtitle({ ...base, isHost: false })).toBe(
      'Waiting for host to start...',
    );
  });
});

describe('getFieldSizeBadge', () => {
  it('handles board size, infinity, grid and checkers modes', () => {
    expect(getFieldSizeBadge('x', undefined)).toBeNull();
    expect(getFieldSizeBadge('x', { boardSize: 3 })).toBe('Field: 3×3');
    expect(getFieldSizeBadge('x', { boardSize: 'infinity' })).toBe('Field: ∞');
    expect(getFieldSizeBadge('x', { gridSize: 5 })).toBe('Grid: 5×5');
    expect(getFieldSizeBadge('checkers_v1', {})).toBe('Board: 8×8');
    expect(getFieldSizeBadge('checkers_v1', { mode: 'international' })).toBe(
      'Board: 10×10',
    );
    expect(getFieldSizeBadge('chess_v1', {})).toBeNull();
  });
});

describe('start option adapters', () => {
  it('withBotDifficulty defaults to medium', () => {
    const fn = vi.fn();
    withBotDifficulty(fn)({ withBots: true, botCount: 1 });
    expect(fn).toHaveBeenCalledWith({
      withBots: true,
      botCount: 1,
      botDifficulty: 'medium',
    });
    withBotDifficulty(fn)({ difficulty: 'hard' });
    expect(fn).toHaveBeenLastCalledWith({
      difficulty: 'hard',
      botDifficulty: 'hard',
    });
    withBotDifficulty(fn)();
    expect(fn).toHaveBeenLastCalledWith({ botDifficulty: 'medium' });
  });

  it('withDifficultyDefault fills difficulty', () => {
    const fn = vi.fn();
    withDifficultyDefault(fn)();
    expect(fn).toHaveBeenCalledWith({ difficulty: 'medium' });
  });

  it('pickBotOptions drops difficulty', () => {
    const fn = vi.fn();
    pickBotOptions(fn)({ withBots: true, botCount: 2, difficulty: 'hard' });
    expect(fn).toHaveBeenCalledWith({ withBots: true, botCount: 2 });
  });
});

describe('buildTableLabels', () => {
  it('builds labels from a prefix', () => {
    const t = (k: string) => `T:${k}`;
    expect(buildTableLabels(t).startLabel).toBe('T:games.table.actions.start');
    expect(buildTableLabels(t, 'games.x.table').waitingLabel).toBe(
      'T:games.x.table.lobby.waitingToStart',
    );
  });
});

describe('buildTableRoomInfoLabels / buildBotLabels', () => {
  const t = (k: string) => `T:${k}`;
  it('builds room info labels', () => {
    expect(buildTableRoomInfoLabels(t).inviteCodeLabel).toBe(
      'T:games.table.lobby.inviteCode',
    );
    expect(buildTableRoomInfoLabels(t).reinviteLabel).toBe(
      'T:games.table.lobby.reinvite',
    );
  });
  it('builds bot labels', () => {
    expect(buildBotLabels(t)).toEqual({
      fastRoomLabel: 'T:games.rooms.fastRoom',
      botCountLabel: 'T:games.lobby.botCountLabel',
      startWithBotsLabel: 'T:games.lobby.startWithBots',
    });
  });
});
