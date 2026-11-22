import type {
  GameTreatId,
  PetActionType,
  PetSpecies,
  PetState,
} from '@arcadeum/games-core';
import type { ArcadePetCollectionResponse } from '@arcadeum/games-core';
import type { SendGiftResult } from './arcade-pet-send-gift';
import type { PetGiftPresent } from '../lib/arcade-pet-economy';
import type { MilestoneId } from '@arcadeum/games-core';
import type { AwaySummary } from '../lib/arcade-pet-away-summary';

export type ArcadePetErrorCode =
  'HOME_FULL' | 'NEED_COINS_UPGRADE' | 'NEED_GEMS_UPGRADE' | 'NEED_COINS_FEED';

/** Locale-independent error; the UI translates it from `code` and `params`. */
export interface ArcadePetActionError {
  code: ArcadePetErrorCode;
  params?: Record<string, string | number>;
}

export interface MilestoneNotice {
  id: MilestoneId;
  rewardCoins: number;
}

export interface ArcadePetStoreState {
  pet: PetState | null;
  pets: PetState[];
  activePetId: string | null;
  gemBalance: number;
  coinBalance: number;
  adoptionCount: number;
  homeCapacity: number;
  queuedThemeForNextPet: string | null;
  presents: PetGiftPresent[];
  isWidgetOpen: boolean;
  isAtHome: boolean;
  activeTreat: GameTreatId | null;
  hasConfirmedCare: boolean;
  /** Last server revision this state was synced with; null if never synced. */
  syncRevision: number | null;
  /** True once the server collection was loaded; economy then runs on the server. */
  serverBacked: boolean;
  actionError: ArcadePetActionError | null;
  awaySummary: AwaySummary | null;
  dailyStreak: number;
  claimedMilestones: string[];
  newMilestones: MilestoneNotice[];
  checkMilestones: () => void;
  dismissMilestones: () => void;
  lastDailyClaimDay: string | null;
  claimDailyBonus: () => { success: boolean; coins: number; streak: number };
  dismissAwaySummary: () => void;
  initialize: (userId?: string, theme?: string) => void;
  performAction: (
    action: PetActionType,
    treatId?: GameTreatId,
    targetPetId?: string,
  ) => { success: boolean; error?: string };
  hatch: (name: string, species: PetSpecies, theme?: string) => void;
  awardTreat: (treatId: GameTreatId) => void;
  adoptRandomPet: () => { success: boolean; pet?: PetState; error?: string };
  adoptSelectedPet: (
    species: PetSpecies,
    theme: string,
    name: string,
  ) => { success: boolean; pet?: PetState; error?: string };
  upgradeHome: (currency: 'coins' | 'gems') => {
    success: boolean;
    error?: string;
  };
  selectActivePet: (petId: string) => void;
  claimPresent: (presentId: string) => {
    success: boolean;
    present?: PetGiftPresent;
  };
  sendGiftPet: (
    recipientId: string,
    recipientName: string,
    gift: {
      species: PetSpecies;
      theme: string;
      petName: string;
      message?: string;
    },
    isAdmin?: boolean,
  ) => Promise<SendGiftResult>;
  buyGameTheme: (themeId: string) => void;
  applyServerCollection: (server: ArcadePetCollectionResponse) => void;
  renamePet: (
    petId: string,
    name: string,
  ) => { success: boolean; error?: 'INVALID_NAME' | 'NOT_FOUND' };
  clearActionError: () => void;
  toggleWidget: () => void;
  setWidgetOpen: (open: boolean) => void;
  toggleHome: () => void;
  setAtHome: (atHome: boolean) => void;
}
