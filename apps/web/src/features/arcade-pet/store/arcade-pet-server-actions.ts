import type {
  ArcadePetEconomyAction,
  ArcadePetEconomyResult,
} from '@arcadeum/games-core';
import {
  buildEconomyPatch,
  buildRollbackPatch,
  buildServerPatch,
  buildSyncPayload,
  performServerAction,
  pushServerCollection,
  syncSignature,
} from '../lib/arcade-pet-sync';
import { persistStore } from './arcade-pet-storage';
import type { ArcadePetStoreState } from './arcade-pet-store-types';

type Getter = () => ArcadePetStoreState;
type Setter = (partial: Partial<ArcadePetStoreState>) => void;

/**
 * Every server call (economy actions and collection pushes) runs through a
 * single FIFO chain so revisions stay consistent and an adoption always
 * reaches the server before the pet state that refers to it.
 */
let chain: Promise<unknown> = Promise.resolve();

export function enqueueServerTask<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task, task);
  chain = run.catch(() => undefined);
  return run;
}

/** Fingerprint of the last pet state known to match the server. */
let lastSyncedSignature = '';

export function markPetsSynced(get: Getter): void {
  lastSyncedSignature = syncSignature(get());
}

export function isPetStateDirty(get: Getter): boolean {
  return syncSignature(get()) !== lastSyncedSignature;
}

/** Test helper: forget queued work and sync bookkeeping. */
export function resetServerQueue(): void {
  chain = Promise.resolve();
  lastSyncedSignature = '';
}

/**
 * Pushes local pet state if it changed. Must run inside the queue. On a
 * revision conflict the server copy replaces local state.
 */
export async function pushPetState(get: Getter, set: Setter): Promise<void> {
  const state = get();
  if (!state.serverBacked || !state.hasConfirmedCare) return;
  if (!isPetStateDirty(get)) return;
  try {
    const result = await pushServerCollection({
      ...buildSyncPayload(state),
      baseRevision: state.syncRevision ?? 0,
    });
    if (result.status === 'conflict') {
      set(buildServerPatch(get(), result.collection));
      persistStore(get());
    } else {
      set({ syncRevision: result.collection.revision });
    }
    markPetsSynced(get);
  } catch {
    // Offline or transient failure: retried on the next local change.
  }
}

/**
 * Applies the server's verdict. On success only server-owned fields are
 * adopted (local pet edits made meanwhile are kept); on rejection the whole
 * server collection replaces the optimistic local state (rollback).
 */
export function applyEconomyResult(
  get: Getter,
  set: Setter,
  result: ArcadePetEconomyResult,
): void {
  if (result.ok) {
    set(buildEconomyPatch(result.collection));
  } else {
    set(buildRollbackPatch(get(), result.collection));
  }
  persistStore(get());
}

/**
 * Sends an economy action to the server after it was applied optimistically.
 * Resolves with the server result, or null when offline / not server-backed
 * (the local optimistic state stays until the next successful sync).
 */
export function sendEconomyAction(
  get: Getter,
  set: Setter,
  action: ArcadePetEconomyAction,
): Promise<ArcadePetEconomyResult | null> {
  if (!get().serverBacked) return Promise.resolve(null);
  return enqueueServerTask(async () => {
    try {
      // Server rules read the server's pets, so make sure it has the latest.
      await pushPetState(get, set);
      const result = await performServerAction(action);
      applyEconomyResult(get, set, result);
      return result;
    } catch {
      return null;
    }
  });
}
