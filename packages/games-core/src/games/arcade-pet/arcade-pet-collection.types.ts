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

export type ArcadePetEconomyActionType = ArcadePetEconomyAction['type'];

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
  | 'SELF_GIFT';

export interface ArcadePetEconomyResult {
  ok: boolean;
  error?: ArcadePetEconomyError;
  collection: ArcadePetCollectionResponse;
}
