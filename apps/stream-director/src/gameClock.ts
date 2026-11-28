import * as crypto from 'crypto';
import type {
  GameClockInput,
  RoomInfoResponse,
  SessionSummary,
  Verdict,
} from './types';

/**
 * Decide what to do with the running game. Pure: all inputs explicit so the
 * "games always end" guarantee is unit-testable.
 */
export function evaluateGame({
  now,
  startedAt,
  maxDurationMs,
  stuckMs,
  lastChangeAt,
  completed = false,
  consecutiveErrors = 0,
  maxErrors = 5,
}: GameClockInput): { verdict: Verdict } {
  if (completed) return { verdict: 'finished' };
  if (now - startedAt >= maxDurationMs) return { verdict: 'timeout' };
  if (consecutiveErrors >= maxErrors) return { verdict: 'error' };
  if (now - lastChangeAt >= stuckMs) return { verdict: 'stuck' };
  return { verdict: 'continue' };
}

/** Stable fingerprint of a session payload, used to notice "no progress". */
export function sessionSignature(
  session: SessionSummary | null | undefined,
): string {
  if (!session) return 'none';
  const basis: unknown = session.updatedAt ?? session.state ?? session;
  return crypto
    .createHash('sha1')
    .update(typeof basis === 'string' ? basis : JSON.stringify(basis))
    .digest('hex');
}

/** True when API payloads say the game is over. */
export function isCompleted(info: RoomInfoResponse = {}): boolean {
  return (
    info.room?.status === 'completed' || info.session?.status === 'completed'
  );
}
