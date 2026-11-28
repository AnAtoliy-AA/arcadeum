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

/**
 * Bump when the stored/localStorage shape changes and add a step to
 * MIGRATIONS in arcade-pet-migration.ts.
 */
export const ARCADE_PET_SCHEMA_VERSION = 2;

/** Everything the server stores for a user's pet collection (minus revision). */
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
  dailyStreak: number;
  lastDailyClaimDay: string | null;
  claimedMilestones: string[];
}

export interface ArcadePetCollectionResponse extends ArcadePetCollectionPayload {
  /** Monotonic server revision; 0 means nothing stored yet. */
  revision: number;
}

/**
 * Client-writable subset. Balances, capacity, presents and rewards are
 * server-owned and only change through economy actions.
 */
export interface SyncArcadePetCollectionRequest {
  /** Revision the client state was derived from. */
  baseRevision: number;
  pets: PetState[];
  activePetId: string | null;
  isAtHome: boolean;
}

export interface SyncArcadePetCollectionResult {
  status: 'ok' | 'conflict';
  collection: ArcadePetCollectionResponse;
}

export type ArcadePetEconomyAction =
  | {
      type: 'adopt_random';
      petId: string;
      species: PetSpecies;
      theme: string;
      name: string;
    }
  | {
      type: 'adopt_selected';
      petId: string;
      species: PetSpecies;
      theme: string;
      name: string;
    }
  | { type: 'upgrade_home'; currency: 'coins' | 'gems' }
  | { type: 'feed_snack'; petId: string }
  | { type: 'claim_present'; presentId: string; petId: string }
  | {
      type: 'send_gift';
      recipientUsername: string;
      species: PetSpecies;
      theme: string;
      petName: string;
      message?: string;
    }
  | { type: 'claim_daily' }
  | { type: 'claim_milestones' }
  | { type: 'queue_theme'; themeId: string };

/**
 * Economy action as sent over the wire. `actionId` (uuid) is generated once
 * per user action and reused on retries, so the server applies it only once.
 */
export type ArcadePetEconomyRequest = ArcadePetEconomyAction & {
  actionId?: string;
};

export type ArcadePetEconomyActionType = ArcadePetEconomyAction['type'];

export const ARCADE_PET_ECONOMY_ACTION_TYPES = [
  'adopt_random',
  'adopt_selected',
  'upgrade_home',
  'feed_snack',
  'claim_present',
  'send_gift',
  'claim_daily',
  'claim_milestones',
  'queue_theme',
] as const satisfies readonly ArcadePetEconomyActionType[];

export type ArcadePetEconomyError =
  | 'HOME_FULL'
  | 'HOME_MAX'
  | 'INSUFFICIENT_GEMS'
  | 'INSUFFICIENT_COINS'
  | 'PET_NOT_FOUND'
  | 'PRESENT_NOT_FOUND'
  | 'INVALID_SPEC'
  | 'DUPLICATE_PET'
  | 'ALREADY_CLAIMED'
  | 'NOTHING_TO_CLAIM'
  | 'RECIPIENT_NOT_FOUND'
  | 'SELF_GIFT'
  | 'INBOX_FULL'
  | 'CONTENTION';

/** HTTP status the REST API uses for each domain rejection. */
export const ARCADE_PET_ERROR_HTTP_STATUS = {
  HOME_FULL: 409,
  HOME_MAX: 409,
  INSUFFICIENT_GEMS: 402,
  INSUFFICIENT_COINS: 402,
  PET_NOT_FOUND: 404,
  PRESENT_NOT_FOUND: 404,
  INVALID_SPEC: 400,
  DUPLICATE_PET: 409,
  ALREADY_CLAIMED: 409,
  NOTHING_TO_CLAIM: 409,
  RECIPIENT_NOT_FOUND: 404,
  SELF_GIFT: 400,
  INBOX_FULL: 409,
  CONTENTION: 409,
} as const satisfies Record<ArcadePetEconomyError, 400 | 402 | 404 | 409>;

/**
 * Economy outcome as seen by the services. Over REST a rejection is an HTTP
 * error (see ARCADE_PET_ERROR_HTTP_STATUS) whose body still carries the
 * authoritative collection, so the client can roll back its optimistic update.
 */
export type ArcadePetEconomyResult =
  | { ok: true; collection: ArcadePetCollectionResponse }
  | {
      ok: false;
      error: ArcadePetEconomyError;
      collection: ArcadePetCollectionResponse;
    };
