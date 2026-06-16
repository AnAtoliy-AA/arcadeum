import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Guards against double-clicking the start button while waiting for the
 * backend to emit `games.session.started`. Snapshots the session id at click
 * time and clears the pending flag once a *different* session id arrives.
 * A 6 s safety timeout covers BE rejection where the started event never
 * arrives.
 */
export function usePendingStart(sessionId: string | null | undefined) {
  const [triggerSessionId, setTriggerSessionId] = useState<string | null>(null);
  const [expiry, setExpiry] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pending = expiry > 0 && !(sessionId && sessionId !== triggerSessionId);

  useEffect(() => {
    if (expiry === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setExpiry(0), 6000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [expiry]);

  const markPending = useCallback(() => {
    setTriggerSessionId(sessionId ?? null);
    setExpiry(1);
  }, [sessionId]);

  return { pendingStart: pending, markPendingStart: markPending } as const;
}
