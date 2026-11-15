import type {
  GameTreatId,
  PetActionType,
  PetSpecies,
  PetState,
} from '@arcadeum/games-core';
import type { PetGiftPresent } from '../lib/arcade-pet-economy';
import type { AwaySummary } from '../lib/arcade-pet-away-summary';

export type ArcadePetErrorCode =
  'HOME_FULL' | 'NEED_COINS_UPGRADE' | 'NEED_GEMS_UPGRADE' | 'NEED_COINS_FEED';

/** Locale-independent error; the UI translates it from `code` and `params`. */
export interface ArcadePetActionError {
  code: ArcadePetErrorCode;
  params?: Record<string, string | number>;
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
  actionError: ArcadePetActionError | null;
  awaySummary: AwaySummary | null;
  dailyStreak: number;
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
  ) => { success: boolean; error?: string };
  buyGameTheme: (themeId: string) => void;
  addGems: (amount: number) => void;
  addCoins: (amount: number) => void;
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
