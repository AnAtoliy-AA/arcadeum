export type PetStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'senior';

export type PetSpecies =
  | 'slime'
  | 'dragon'
  | 'cyber_cat'
  | 'dino'
  | 'blob';

export type PetMood = 'happy' | 'neutral' | 'sad' | 'sleeping' | 'sick' | 'hungry';

export type PetActionType =
  | 'hatch'
  | 'feed_meal'
  | 'feed_snack'
  | 'feed_treat'
  | 'play'
  | 'clean'
  | 'sleep'
  | 'wake'
  | 'heal'
  | 'train'
  | 'praise'
  | 'scold';

export type GameTreatId =
  | 'chess_cookie'
  | 'sea_battle_fish'
  | 'hearts_candy'
  | 'critical_pepper'
  | 'pachisi_spice';

export interface PetStats {
  hunger: number;
  happiness: number;
  energy: number;
  hygiene: number;
  discipline: number;
  health: number;
  weight: number;
  level: number;
  xp: number;
  growthHours?: number;
}

export interface PetTimestamps {
  bornAt: number;
  lastInteractedAt: number;
  lastFedAt: number;
  lastSleptAt: number;
  lastCleanedAt: number;
  lastTrainedAt: number;
}

export interface PetState {
  id: string;
  name: string;
  species: PetSpecies;
  stage: PetStage;
  theme: string;
  stats: PetStats;
  timestamps: PetTimestamps;
  isSleeping: boolean;
  poopCount: number;
  isSick: boolean;
  inventory: Record<GameTreatId, number>;
  careMistakes: number;
  mood: PetMood;
}

export interface ArcadePetActionPayload {
  action: PetActionType;
  treatId?: GameTreatId;
  name?: string;
  species?: PetSpecies;
  theme?: string;
}

export interface ArcadePetActionResult {
  success: boolean;
  messageCode: string;
  state: PetState;
}
