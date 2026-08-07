import type { Logger } from '@nestjs/common';
import type { GameSession } from '../schemas/game-session.schema';

/** Max session document size in bytes. Typical: 2-13KB. Alert at 100KB, strip at 500KB. */
export const WARN_DOC_SIZE_BYTES = 100 * 1024;
export const STRIP_DOC_SIZE_BYTES = 500 * 1024;

/**
 * Strip stateHistory and logs if the session document is approaching the
 * MongoDB BSON size limit. Returns true if state was modified.
 */
export function enforceStateSizeLimit(
  session: GameSession,
  sessionId: string,
  logger: Logger,
): boolean {
  const approxSize = Buffer.byteLength(JSON.stringify(session.state), 'utf-8');
  if (approxSize > STRIP_DOC_SIZE_BYTES) {
    logger.warn(
      `Session ${sessionId} state is ${Math.round(approxSize / 1024)}KB — stripping stateHistory and logs.`,
    );
    const s = session.state;
    if (Array.isArray(s.stateHistory)) s.stateHistory = [];
    if (Array.isArray(s.logs)) s.logs = s.logs.slice(-20);
    session.markModified('state');
    return true;
  }
  if (approxSize > WARN_DOC_SIZE_BYTES) {
    logger.warn(
      `Session ${sessionId} state is ${Math.round(approxSize / 1024)}KB — approaching size limit.`,
    );
  }
  return false;
}
