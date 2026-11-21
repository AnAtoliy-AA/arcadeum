import { applyDeterministicDecay } from '@arcadeum/games-core';
import type {
  ArcadePetCollectionPayload,
  ArcadePetCollectionResponse,
  PetGiftPresentPayload,
  SyncArcadePetCollectionRequest,
  SyncArcadePetCollectionResult,
} from '@arcadeum/games-core';
import { apiClient } from '@/shared/lib/api-client';
import type { ArcadePetStoreState } from '../store/arcade-pet-store-types';

const COLLECTION_PATH = '/arcade-pet/collection';

export type SyncableState = Pick<
  ArcadePetStoreState,
  | 'pets'
  | 'activePetId'
  | 'gemBalance'
  | 'coinBalance'
  | 'adoptionCount'
  | 'homeCapacity'
  | 'queuedThemeForNextPet'
  | 'presents'
  | 'hasConfirmedCare'
  | 'isAtHome'
>;

export function fetchServerCollection(): Promise<ArcadePetCollectionResponse> {
  return apiClient.fetch<ArcadePetCollectionResponse>(COLLECTION_PATH);
}

export function pushServerCollection(
  request: SyncArcadePetCollectionRequest,
): Promise<SyncArcadePetCollectionResult> {
  return apiClient.fetch<SyncArcadePetCollectionResult>(COLLECTION_PATH, {
    method: 'PUT',
    data: request,
  });
}

export function buildCollectionPayload(
  state: SyncableState,
): ArcadePetCollectionPayload {
  return {
    pets: state.pets,
    activePetId: state.activePetId,
    gemBalance: Math.max(0, Math.floor(state.gemBalance)),
    coinBalance: Math.max(0, Math.floor(state.coinBalance)),
    adoptionCount: state.adoptionCount,
    homeCapacity: state.homeCapacity,
    queuedThemeForNextPet: state.queuedThemeForNextPet,
    presents: state.presents,
    hasConfirmedCare: state.hasConfirmedCare,
    isAtHome: state.isAtHome,
  };
}

/** Stable fingerprint used to skip pushes when nothing changed. */
export function collectionSignature(state: SyncableState): string {
  return JSON.stringify(buildCollectionPayload(state));
}

/** Union by id; a present opened on either side stays opened. */
export function mergePresentLists(
  local: PetGiftPresentPayload[],
  server: PetGiftPresentPayload[],
): PetGiftPresentPayload[] {
  const localById = new Map(local.map((p) => [p.id, p]));
  const merged = server.map((p) => ({
    ...p,
    isOpened: p.isOpened || localById.get(p.id)?.isOpened === true,
  }));
  const serverIds = new Set(server.map((p) => p.id));
  for (const p of local) {
    if (!serverIds.has(p.id)) merged.push(p);
  }
  return merged;
}

export type PullDecision = 'push-local' | 'apply-server' | 'in-sync';

/**
 * Decides how to reconcile local state with the server copy on load.
 * Server wins whenever it holds pets or a newer revision than the one the
 * local state was derived from; a never-synced local collection seeds an
 * empty server record.
 */
export function decidePull(
  local: Pick<ArcadePetStoreState, 'hasConfirmedCare' | 'syncRevision'>,
  server: ArcadePetCollectionResponse,
): PullDecision {
  const serverHasPets = server.hasConfirmedCare && server.pets.length > 0;
  if (!serverHasPets) {
    return local.hasConfirmedCare ? 'push-local' : 'in-sync';
  }
  return local.syncRevision === server.revision ? 'in-sync' : 'apply-server';
}

/** State patch produced by adopting a server collection. */
export function buildServerPatch(
  local: Pick<ArcadePetStoreState, 'presents' | 'activePetId'>,
  server: ArcadePetCollectionResponse,
): Partial<ArcadePetStoreState> {
  const pets = server.pets.map((p) =>
    applyDeterministicDecay(p, undefined, { isAtHome: server.isAtHome }),
  );
  const active =
    pets.find((p) => p.id === (server.activePetId ?? local.activePetId)) ??
    pets[0] ??
    null;
  return {
    pets,
    pet: active,
    activePetId: active?.id ?? null,
    gemBalance: server.gemBalance,
    coinBalance: server.coinBalance,
    adoptionCount: server.adoptionCount,
    homeCapacity: server.homeCapacity,
    queuedThemeForNextPet: server.queuedThemeForNextPet,
    presents: mergePresentLists(local.presents, server.presents),
    hasConfirmedCare: server.hasConfirmedCare,
    isAtHome: server.isAtHome,
    syncRevision: server.revision,
  };
}
