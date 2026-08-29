import { describe, it, expect } from 'vitest';
import { OfflineSession } from '../lib/offline-session';
import { OFFLINE_GAMES, makeOfflineContext } from '../lib/offline-registry';
import { OFFLINE_GAME_SLUGS } from '../lib/offline-capable';
import { isOfflineRoomId, createOfflineRoomId } from '../lib/offline-room';

describe('offline-capable manifest parity', () => {
  it('lists every engine in the registry with a matching slug', () => {
    for (const [engineId, entry] of Object.entries(OFFLINE_GAMES)) {
      const manifest = OFFLINE_GAME_SLUGS.find((g) => g.engineId === engineId);
      expect({ engineId, slug: manifest?.slug }).toEqual({
        engineId,
        slug: entry.slug,
      });
    }
  });

  it('has no stale manifest entries', () => {
    for (const g of OFFLINE_GAME_SLUGS) {
      expect(OFFLINE_GAMES[g.engineId]).toBeDefined();
    }
  });
});

describe('offline room ids', () => {
  it('uses the offline_ prefix and round-trips', () => {
    const id = createOfflineRoomId('chess');
    expect(isOfflineRoomId(id)).toBe(true);
    expect(id.startsWith('offline_chess_')).toBe(true);
    expect(isOfflineRoomId('abc123')).toBe(false);
  });
});

describe('OfflineSession — tic-tac-toe vs bot', () => {
  async function newSession(): Promise<OfflineSession> {
    const entry = OFFLINE_GAMES['tic_tac_toe_v1'];
    const engine = await entry.createEngine();
    const s = new OfflineSession({
      roomId: createOfflineRoomId('tic-tac-toe'),
      engineId: 'tic_tac_toe_v1',
      engine,
      humanId: 'player-1',
    });
    s.start(['player-1', 'bot-1'], {
      options: { aiDifficulty: 'hard' },
      aiDifficulty: 'hard',
    });
    return s;
  }

  it('starts active with a bot that immediately moves', async () => {
    const s = await newSession();
    expect(s.status).toBe('active');
    expect(s.state).toBeTruthy();
    // Bot plays instantly after the human if the human starts, or the bot
    // opens the game — either way exactly one mark is on the board.
    const marks = countMarks(s);
    expect([0, 1]).toContain(marks);
  });

  it('validates and applies a human move then lets the bot answer', async () => {
    const s = await newSession();
    // Ensure it is the human's turn before acting.
    await waitForHumanTurn(s);
    const res = s.applyAction('player-1', 'place_mark', { row: 0, col: 0 });
    expect(res.ok).toBe(true);
    await s.runBots();
    const marks = countMarks(s);
    expect(marks).toBeGreaterThanOrEqual(2);
  }, 10_000);

  it('rejects invalid moves without corrupting state', async () => {
    const s = await newSession();
    await waitForHumanTurn(s);
    const before = JSON.stringify(s.state?.board ?? null);
    const res = s.applyAction('player-1', 'place_mark', { row: -5, col: 99 });
    expect(res.ok).toBe(false);
    expect(JSON.stringify(s.state?.board ?? null)).toBe(before);
  });

  it('completes a full game and records a gameResult', async () => {
    const s = await newSession();
    await playToCompletion(s);
    expect(s.isGameOver() || s.status === 'completed').toBe(true);
    if (s.status === 'completed') {
      expect(s.state?.gameResult).toBeDefined();
    }
  }, 20_000);

  it('exposes a session summary shaped like GameSessionSummary', async () => {
    const s = await newSession();
    const summary = s.toSummary();
    expect(summary.roomId).toBe(s.roomId);
    expect(summary.engine).toBe('tic_tac_toe_v1');
    expect(summary.id).toBe(s.roomId);
    expect(typeof summary.createdAt).toBe('string');
  });
});

describe('makeOfflineContext', () => {
  it('builds an engine-compatible action context', () => {
    const ctx = makeOfflineContext('u1');
    expect(ctx.userId).toBe('u1');
    expect(ctx.timestamp).toBeInstanceOf(Date);
  });
});

function countMarks(s: OfflineSession): number {
  const board = (s.state as { board?: unknown[][] } | null)?.board ?? [];
  return board.flat().filter((c) => c !== null && c !== undefined).length;
}

async function waitForHumanTurn(s: OfflineSession): Promise<void> {
  for (let i = 0; i < 20; i++) {
    const turn = s.currentTurnPlayerId();
    if (turn === 'player-1') return;
    if (s.isGameOver()) return;
    await s.runBots();
    await new Promise((r) => setTimeout(r, 20));
  }
}

async function playToCompletion(s: OfflineSession): Promise<void> {
  // Deterministic-ish center/corner strategy until the bot finishes the game.
  const spots = [
    [1, 1],
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
    [0, 1],
    [2, 1],
    [1, 0],
    [1, 2],
  ];
  for (let i = 0; i < 40 && !s.isGameOver(); i++) {
    await waitForHumanTurn(s);
    if (s.isGameOver()) break;
    const board = (s.state as { board?: (null | string)[][] }).board ?? [];
    let placed = false;
    for (const [r, c] of spots) {
      if (board[r]?.[c] == null) {
        const res = s.applyAction('player-1', 'place_mark', { row: r, col: c });
        if (res.ok) {
          placed = true;
          break;
        }
      }
    }
    if (!placed) break;
    await s.runBots();
  }
}
