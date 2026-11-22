'use client';

import { useCallback, useEffect, useState } from 'react';
import { useArcadePetStore } from '../store/useArcadePetStore';
import { decidePull, fetchServerCollection } from '../lib/arcade-pet-sync';
import {
  enqueueServerTask,
  isPetStateDirty,
  markPetsSynced,
  pushPetState,
} from '../store/arcade-pet-server-actions';
import { persistStore } from '../store/arcade-pet-storage';

const PUSH_DEBOUNCE_MS = 1500;

export type ArcadePetSyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export interface ArcadePetSyncState {
  status: ArcadePetSyncStatus;
  /** Re-runs the initial pull after a failure. */
  retry: () => void;
}

/**
 * Keeps the local pet collection in sync with the server for signed-in
 * users. The server is the source of truth: it is pulled once on mount and
 * whenever its revision differs. Pet care state is pushed (debounced) with
 * optimistic concurrency; balances and rewards only change through the
 * economy actions in `arcade-pet-server-actions`. A failed pull is reported
 * as `status: 'error'` (the UI shows a retry); the localStorage copy keeps
 * working in the meantime.
 */
export function useArcadePetSync(enabled: boolean): ArcadePetSyncState {
  const [attempt, setAttempt] = useState(0);
  // The outcome is tagged with the attempt that produced it, so a retry shows
  // 'syncing' again without resetting state synchronously inside the effect.
  const [outcome, setOutcome] = useState<{
    attempt: number;
    result: 'synced' | 'error';
  } | null>(null);
  const status: ArcadePetSyncStatus = !enabled
    ? 'idle'
    : outcome?.attempt === attempt
      ? outcome.result
      : 'syncing';
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    useArcadePetStore.setState({ syncPending: true });
    let timer: ReturnType<typeof setTimeout> | null = null;
    const store = useArcadePetStore;
    const get = store.getState;
    const set = store.setState;

    const schedulePush = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void enqueueServerTask(() => pushPetState(get, set));
      }, PUSH_DEBOUNCE_MS);
    };

    const unsubscribe = store.subscribe(() => {
      if (get().serverBacked && isPetStateDirty(get)) schedulePush();
    });

    void (async () => {
      try {
        const server = await enqueueServerTask(fetchServerCollection);
        if (cancelled) return;
        if (decidePull(get(), server) === 'apply-server') {
          get().applyServerCollection(server);
          markPetsSynced(get);
        } else {
          // Same revision: local pet edits may still be unsynced, push them.
          set({ syncRevision: server.revision });
          persistStore(get());
        }
        set({ serverBacked: true });
        if (isPetStateDirty(get)) schedulePush();
        if (!cancelled) setOutcome({ attempt, result: 'synced' });
      } catch {
        // Stay local-only until the user retries or the next mount.
        if (!cancelled) setOutcome({ attempt, result: 'error' });
      } finally {
        if (!cancelled) set({ syncPending: false });
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
      if (timer) clearTimeout(timer);
      set({ serverBacked: false, syncPending: false });
    };
  }, [enabled, attempt]);

  return { status, retry };
}
