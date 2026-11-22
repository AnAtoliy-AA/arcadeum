'use client';

import { useEffect } from 'react';
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

/**
 * Keeps the local pet collection in sync with the server for signed-in
 * users. The server is the source of truth: it is pulled once on mount and
 * whenever its revision differs. Pet care state is pushed (debounced) with
 * optimistic concurrency; balances and rewards only change through the
 * economy actions in `arcade-pet-server-actions`. Failures are silent: the
 * localStorage copy keeps the UI working until the next successful sync.
 */
export function useArcadePetSync(enabled: boolean): void {
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
      } catch {
        // Stay local-only until the next mount.
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
  }, [enabled]);
}
