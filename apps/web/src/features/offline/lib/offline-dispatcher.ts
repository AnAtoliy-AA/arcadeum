import { OFFLINE_GAMES } from './offline-registry';
import { OfflineSession } from './offline-session';
import { isOfflineRoomId } from './offline-room';

/**
 * Receives `<game>.session.*` socket-style events for offline rooms and runs
 * them against a local engine + bot instead of the network.
 */
const sessions = new Map<string, OfflineSession>();

function botIdsFor(count: number | undefined): string[] {
  const n = Math.max(1, Math.min(3, Number(count ?? 1) || 1));
  return Array.from({ length: n }, (_v, i) => `bot-${i + 1}`);
}

function difficultyFromPayload(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const difficulty =
    (payload.botDifficulty as string | undefined) ??
    (payload.difficulty as string | undefined) ??
    'medium';
  return {
    options: {
      aiDifficulty: difficulty,
      ...(payload.options as Record<string, unknown> | undefined),
    },
    aiDifficulty: difficulty,
    ...payload,
  };
}

export function handleOfflineGameEvent(
  event: string,
  payload: Record<string, unknown>,
): void {
  const roomId = payload.roomId;
  if (typeof roomId !== 'string' || !isOfflineRoomId(roomId)) return;

  const session = sessions.get(roomId);
  if (!session) return; // the offline page owns session creation

  const dot = event.indexOf('.');
  const suffix = event.slice(dot + 1).replace(/^session\./, '');
  const entry = OFFLINE_GAMES[session.engineId];
  if (!entry) return;

  if (suffix === 'start') {
    session.start(
      [String(payload.userId ?? session.humanId), ...botIdsFor(payload.botCount as number | undefined)],
      difficultyFromPayload(payload),
    );
    return;
  }

  const userId = String(payload.userId ?? session.humanId);
  const mapping = entry.actions[suffix];
  if (!mapping || mapping.action === '__ignore__') return;

  if (mapping.action === 'forfeit') {
    endSessionAsForfeit(session, userId);
    return;
  }

  const enginePayload = mapping.mapPayload
    ? mapping.mapPayload(payload)
    : Object.fromEntries(
        Object.entries(payload).filter(
          ([k]) => !['roomId', 'userId'].includes(k),
        ),
      );
  const result = session.applyAction(userId, mapping.action, enginePayload);
  if (!result.ok) {
    console.warn(`[offline] action rejected: ${result.error}`);
  } else {
    void session.runBots();
  }
}

/** Register a session created by the offline page (before any emit). */
export function attachSession(session: OfflineSession): void {
  sessions.set(session.roomId, session);
}

export function getSession(roomId: string): OfflineSession | undefined {
  return sessions.get(roomId);
}

export function endSessionAsForfeit(
  session: OfflineSession,
  userId: string,
): void {
  if (!session.state) return;
  const res = session.applyAction(userId, 'forfeit');
  if (!res.ok) {
    // Engines without a forfeit action: mark completed via result fallback.
    session.status = 'completed';
    try {
      session.state.gameResult = session.engine.getResult(session.state);
    } catch {
      /* noop */
    }
    session.publishSnapshot();
  }
}

export function disposeSession(roomId: string): void {
  sessions.delete(roomId);
}
