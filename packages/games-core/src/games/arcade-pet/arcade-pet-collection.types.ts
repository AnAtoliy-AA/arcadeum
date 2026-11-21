import type { PetSpecies, PetState } from './arcade-pet.types';

export interface PetGiftPresentPayload {
  id: string;
  senderId: string;
  senderName: string;
  species: PetSpecies;
  theme: string;
  petName: string;
  message?: string;
  createdAt: number;
  isOpened: boolean;
}

/** Per-user pet collection persisted on the server. */
export interface ArcadePetCollectionPayload {
  pets: PetState[];
  activePetId: string | null;
  gemBalance: number;
  coinBalance: number;
  adoptionCount: number;
  homeCapacity: number;
  queuedThemeForNextPet: string | null;
  presents: PetGiftPresentPayload[];
  hasConfirmedCare: boolean;
  isAtHome: boolean;
}

export interface ArcadePetCollectionResponse
  extends ArcadePetCollectionPayload {
  /** Monotonic server revision; 0 means nothing stored yet. */
  revision: number;
}

export interface SyncArcadePetCollectionRequest
  extends ArcadePetCollectionPayload {
  /** Revision the client state was derived from. */
  baseRevision: number;
}

export interface SyncArcadePetCollectionResult {
  status: 'ok' | 'conflict';
  collection: ArcadePetCollectionResponse;
}
