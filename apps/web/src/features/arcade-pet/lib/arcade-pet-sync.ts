import { applyDeterministicDecay } from '@arcadeum/games-core';
import type {
  ArcadePetCollectionResponse,
  ArcadePetEconomyAction,
  ArcadePetEconomyResult,
  SyncArcadePetCollectionRequest,
  SyncArcadePetCollectionResult,
} from '@arcadeum/games-core';
import { apiClient } from '@/shared/lib/api-client';
import type { ArcadePetStoreState } from '../store/arcade-pet-store-types';

const COLLECTION_PATH = '/arcade-pet/collection';

export type SyncableState = Pick<
  ArcadePetStoreState,
  'pets' | 'activePetId' | 'isAtHome'
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

export function performServerAction(
  action: ArcadePetEconomyAction,
): Promise<ArcadePetEconomyResult> {
  return apiClient.fetch<ArcadePetEconomyResult>(`${COLLECTION_PATH}/action`, {
    method: 'POST',
    data: action,
  });
}

/** Client-writable part of the collection; everything else is server-owned. */
export function buildSyncPayload(
  state: SyncableState,
): Omit<SyncArcadePetCollectionRequest, 'baseRevision'> {
  return {
    pets: state.pets,
    activePetId: state.activePetId,
    isAtHome: state.isAtHome,
  };
}

/** Stable fingerprint used to skip pushes when nothing changed. */
export function syncSignature(state: SyncableState): string {
  return JSON.stringify(buildSyncPayload(state));
}

export type PullDecision = 'apply-server' | 'in-sync';

/** Server is the source of truth: adopt it whenever the revision differs. */
export function decidePull(
  local: Pick<ArcadePetStoreState, 'syncRevision'>,
  server: ArcadePetCollectionResponse,
): PullDecision {
  return local.syncRevision === server.revision ? 'in-sync' : 'apply-server';
}

/** Server-owned fields only; pets are left to the caller. */
export function buildEconomyPatch(
  server: ArcadePetCollectionResponse,
): Partial<ArcadePetStoreState> {
  return {
    gemBalance: server.gemBalance,
    coinBalance: server.coinBalance,
    adoptionCount: server.adoptionCount,
    homeCapacity: server.homeCapacity,
    queuedThemeForNextPet: server.queuedThemeForNextPet,
    presents: server.presents,
    hasConfirmedCare: server.hasConfirmedCare,
    dailyStreak: server.dailyStreak,
    lastDailyClaimDay: server.lastDailyClaimDay,
    claimedMilestones: server.claimedMilestones,
    syncRevision: server.revision,
  };
}

/** Full state patch produced by adopting the server collection. */
export function buildServerPatch(
  local: Pick<ArcadePetStoreState, 'activePetId'>,
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
    ...buildEconomyPatch(server),
    pets,
    pet: active,
    activePetId: active?.id ?? null,
    isAtHome: server.isAtHome,
  };
}

/**
 * Patch used when the server rejects an optimistic action: server-owned
 * fields are reset to the server's truth and the pet list follows the server
 * (unknown optimistic pets are dropped), but local state of pets the server
 * knows is kept so unsynced care edits are not lost.
 */
export function buildRollbackPatch(
  local: Pick<ArcadePetStoreState, 'pets' | 'activePetId'>,
  server: ArcadePetCollectionResponse,
): Partial<ArcadePetStoreState> {
  const localById = new Map(local.pets.map((p) => [p.id, p]));
  const pets = server.pets.map((p) => localById.get(p.id) ?? p);
  const active =
    pets.find((p) => p.id === (local.activePetId ?? server.activePetId)) ??
    pets[0] ??
    null;
  return {
    ...buildEconomyPatch(server),
    pets,
    pet: active,
    activePetId: active?.id ?? null,
  };
}
