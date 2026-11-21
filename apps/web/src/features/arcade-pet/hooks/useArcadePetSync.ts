'use client';

import { useEffect } from 'react';
import { useArcadePetStore } from '../store/useArcadePetStore';
import {
  buildCollectionPayload,
  collectionSignature,
  decidePull,
  fetchServerCollection,
  mergePresentLists,
  pushServerCollection,
} from '../lib/arcade-pet-sync';

const PUSH_DEBOUNCE_MS = 1500;

/**
 * Keeps the local pet collection in sync with the server for signed-in
 * users: pulls once on mount (server wins when it is newer), then pushes
 * local changes with optimistic concurrency. Failures are silent because
 * the localStorage copy remains the source of truth until the next sync.
 */
export function useArcadePetSync(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let ready = false;
    let inFlight = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let lastSignature = '';

    const store = useArcadePetStore;

    const push = async () => {
      const state = store.getState();
      if (!ready || inFlight || !state.hasConfirmedCare) return;
      const signature = collectionSignature(state);
      if (signature === lastSignature) return;
      inFlight = true;
      try {
        const result = await pushServerCollection({
          ...buildCollectionPayload(state),
          baseRevision: state.syncRevision ?? 0,
        });
        if (cancelled) return;
        if (result.status === 'conflict') {
          store.getState().applyServerCollection(result.collection);
        } else {
          // Keep edits made while the request was in flight; only adopt the
          // new revision and any presents delivered server-side.
          const current = store.getState();
          store.setState({
            syncRevision: result.collection.revision,
            presents: mergePresentLists(
              current.presents,
              result.collection.presents,
            ),
          });
        }
        lastSignature = collectionSignature(store.getState());
      } catch {
        // Offline or transient failure: retried on the next local change.
      } finally {
        inFlight = false;
      }
    };

    const schedulePush = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void push(), PUSH_DEBOUNCE_MS);
    };

    const unsubscribe = store.subscribe(() => {
      if (ready) schedulePush();
    });

    void (async () => {
      try {
        const server = await fetchServerCollection();
        if (cancelled) return;
        const decision = decidePull(store.getState(), server);
        if (decision === 'apply-server') {
          store.getState().applyServerCollection(server);
        } else {
          store.setState({
            syncRevision: server.revision,
            presents: mergePresentLists(
              store.getState().presents,
              server.presents,
            ),
          });
        }
        if (decision !== 'push-local') {
          lastSignature = collectionSignature(store.getState());
        }
        ready = true;
        if (decision === 'push-local') schedulePush();
      } catch {
        // Stay local-only until the next mount.
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [enabled]);
}
