import {
  LAG_QUOTA_MAX_MS,
  MAX_LAG_COMP_MS,
  applyMoveClock,
  isFlagged,
  timeLeftMs,
} from '@arcadeum/games-core/games/chess/chess-clock';
import { ChessEngine } from './chess.engine';
import type { ChessState, TimeControl } from './chess.types';

const engine = new ChessEngine();
const T0 = 1_000_000_000_000;

function game(tc: TimeControl): ChessState {
  const s = engine.initializeState(['w', 'b'], { timeControl: tc });
  s.gameCreatedAt = T0;
  return s;
}

const blitz = (inc: TimeControl['incrementSeconds'] = 0): TimeControl => ({
  type: 'blitz',
  initialSeconds: 180,
  incrementSeconds: inc,
});

describe('chess clock', () => {
  it('gives white a 20s grace period for the first move', () => {
    const s = game(blitz());
    applyMoveClock(s, 'white', T0 + 15_000);
    expect(s.clocks!.white.remainingMs).toBe(180_000);
    expect(s.clocks!.white.lastMoveTimestamp).toBe(T0 + 15_000);
  });

  it('charges sub-second moves in milliseconds (no free moves)', () => {
    const s = game(blitz());
    applyMoveClock(s, 'white', T0 + 20_000);
    s.currentTurnColor = 'black';
    let t = T0 + 20_000;
    for (let i = 0; i < 20; i++) {
      t += 900;
      applyMoveClock(s, 'black', t);
      // Opponent moves instantly so black's next turn starts now.
      s.clocks!.white.lastMoveTimestamp = t;
    }
    // 20 moves of 900ms, each forgiving at most the lag quota.
    const charged = 180_000 - s.clocks!.black.remainingMs!;
    expect(charged).toBeGreaterThan(20 * 900 - LAG_QUOTA_MAX_MS - 20 * 100);
    expect(charged).toBeLessThanOrEqual(20 * 900);
    expect(s.clocks!.black.remainingSeconds).toBe(
      Math.ceil(s.clocks!.black.remainingMs! / 1000),
    );
  });

  it('forgives at most MAX_LAG_COMP_MS per move and drains the quota', () => {
    const s = game(blitz());
    s.clocks!.white.lastMoveTimestamp = T0;
    s.currentTurnColor = 'black';
    applyMoveClock(s, 'black', T0 + 5_000);
    expect(s.clocks!.black.remainingMs).toBe(180_000 - 5_000 + MAX_LAG_COMP_MS);
    expect(s.clocks!.black.lagQuotaMs).toBe(
      LAG_QUOTA_MAX_MS - MAX_LAG_COMP_MS + 100,
    );
  });

  it('adds the increment after charging the move', () => {
    const s = game(blitz(2));
    s.clocks!.white.lastMoveTimestamp = T0;
    s.currentTurnColor = 'black';
    applyMoveClock(s, 'black', T0 + 10_000);
    expect(s.clocks!.black.remainingMs).toBe(
      180_000 - 10_000 + MAX_LAG_COMP_MS + 2_000,
    );
  });

  it('resets the daily allowance every move', () => {
    const s = game({
      type: 'daily',
      initialSeconds: 0,
      incrementSeconds: 0,
      daysPerMove: 2,
    });
    s.clocks!.white.lastMoveTimestamp = T0;
    s.currentTurnColor = 'black';
    applyMoveClock(s, 'black', T0 + 30 * 3_600_000);
    expect(s.clocks!.black.remainingMs).toBe(2 * 86_400_000);
  });

  it('flags only once time plus available lag allowance is used up', () => {
    const s = game(blitz());
    s.clocks!.white.lastMoveTimestamp = T0;
    s.currentTurnColor = 'black';
    s.clocks!.black.remainingMs = 1_000;
    expect(timeLeftMs(s, T0 + 1_200)).toBe(-200);
    expect(isFlagged(s, T0 + 1_200)).toBe(false);
    expect(isFlagged(s, T0 + 1_000 + MAX_LAG_COMP_MS)).toBe(true);
  });

  it('flags a daily game after the allowed days', () => {
    const s = game({
      type: 'daily',
      initialSeconds: 0,
      incrementSeconds: 0,
      daysPerMove: 1,
    });
    s.clocks!.white.lastMoveTimestamp = T0;
    s.currentTurnColor = 'black';
    expect(isFlagged(s, T0 + 86_400_000 - 1)).toBe(false);
    expect(isFlagged(s, T0 + 86_400_000)).toBe(true);
  });

  it('reads legacy clocks that only have whole seconds', () => {
    const s = game(blitz());
    s.clocks!.white.lastMoveTimestamp = T0;
    s.currentTurnColor = 'black';
    delete s.clocks!.black.remainingMs;
    s.clocks!.black.remainingSeconds = 42;
    expect(timeLeftMs(s, T0)).toBe(42_000);
  });
});
