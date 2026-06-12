import { useState, useEffect, useCallback } from 'react';

/**
 * Guards against double-clicking the start button while waiting for the
 * backend to emit `games.session.started`. Snapshots the session id at click
 * time and clears the pending flag once a *different* session id arrives.
 * A 6 s safety timeout covers BE rejection where the started event never
 * arrives.
 */
export function usePendingStart(sessionId: string | null | undefined) {
  const [pending, setPending] = useState(false);
  const [triggerSessionId, setTriggerSessionId] = useState<string | null>(null);

  if (pending && sessionId && sessionId !== triggerSessionId) {
    setPending(false);
  }

  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(() => setPending(false), 6000);
    return () => clearTimeout(t);
  }, [pending]);

  const markPending = useCallback(() => {
    setTriggerSessionId(sessionId ?? null);
    setPending(true);
  }, [sessionId]);

  return { pendingStart: pending, markPendingStart: markPending } as const;
}
