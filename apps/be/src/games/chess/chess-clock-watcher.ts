import type { Logger } from '@nestjs/common';
import {
  MAX_LAG_COMP_MS,
  isFlagged,
  timeLeftMs,
} from '@arcadeum/games-core/games/chess/chess-clock';
import { isChessGameOver } from '@arcadeum/games-core/games/chess/chess-engine-rules';
import type { ChessState } from '../engines/chess/chess.types';
import type { GameSessionSummary } from '../sessions/game-sessions.service';

/** Extra wait after the deadline so the engine sees the flag as fallen. */
const FLAG_SLACK_MS = 50;
/** setTimeout cannot wait longer than ~24.8 days. */
const MAX_TIMER_MS = 2_147_483_647;

type LoadSession = (roomId: string) => Promise<GameSessionSummary | null>;
type RunAction = (
  userId: string,
  roomId: string,
  action: 'timeout' | 'abort',
) => Promise<unknown>;

/**
 * Server-authoritative flag detection for chess clocks.
 *
 * - `schedule` arms a per-room timer for the exact moment the side to move
 *   runs out of time, so flags fall on time even if nobody sends anything.
 * - `check` is also called on every move attempt, on session reads
 *   (reconnects and state requests) and by the stale-session watchdog, so a
 *   flag is still caught after a server restart.
 */
export class ChessClockWatcher {
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(
    private readonly loadSession: LoadSession,
    private readonly runAction: RunAction,
    private readonly logger: Logger,
  ) {}

  /** Returns true when the side to move had flagged and the flag was applied. */
  async check(session: GameSessionSummary): Promise<boolean> {
    const state = withCreatedAt(session);
    if (!state || session.status !== 'active') return false;
    if (!state.clocks || isChessGameOver(state)) return false;
    if (!isFlagged(state)) return false;

    const loser = state.players.find((p) => p.color === state.currentTurnColor);
    if (!loser) return false;
    // A side that never moved aborts the game (no result); otherwise the
    // engine judges the flag (loss, or draw vs. no mating material).
    const neverMoved = !state.moveHistory.some(
      (m) => m.piece.color === loser.color,
    );
    try {
      await this.runAction(
        loser.playerId,
        session.roomId,
        neverMoved ? 'abort' : 'timeout',
      );
      return true;
    } catch (err) {
      // Another instance may have applied the flag first.
      this.logger.debug?.(
        `[Chess] flag for room ${session.roomId} not applied: ${String(err)}`,
      );
      return false;
    }
  }

  schedule(session: GameSessionSummary): void {
    this.clear(session.roomId);
    const state = withCreatedAt(session);
    if (!state?.clocks || session.status !== 'active') return;
    if (isChessGameOver(state)) return;
    const left = timeLeftMs(state);
    if (left === null) return;
    const delay = Math.min(
      MAX_TIMER_MS,
      Math.max(0, left + MAX_LAG_COMP_MS + FLAG_SLACK_MS),
    );
    const roomId = session.roomId;
    const timer = setTimeout(() => {
      this.timers.delete(roomId);
      void this.loadSession(roomId)
        .then((fresh) => (fresh ? this.check(fresh) : false))
        .catch((err: unknown) =>
          this.logger.error(
            `[Chess] flag timer failed for room ${roomId}: ${String(err)}`,
          ),
        );
    }, delay);
    timer.unref?.();
    this.timers.set(roomId, timer);
  }

  clear(roomId: string): void {
    const timer = this.timers.get(roomId);
    if (timer) clearTimeout(timer);
    this.timers.delete(roomId);
  }

  stopAll(): void {
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }

  get size(): number {
    return this.timers.size;
  }
}

/** Legacy sessions may lack gameCreatedAt; fall back to the session's. */
function withCreatedAt(session: GameSessionSummary): ChessState | undefined {
  const state = session.state as ChessState | undefined;
  if (!state) return undefined;
  if (state.gameCreatedAt > 0) return state;
  const created = new Date(session.createdAt).getTime();
  return { ...state, gameCreatedAt: Number.isFinite(created) ? created : 0 };
}
