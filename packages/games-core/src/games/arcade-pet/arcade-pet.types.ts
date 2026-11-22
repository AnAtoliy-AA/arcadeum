export const PET_STAGES = [
  'egg',
  'baby',
  'child',
  'teen',
  'adult',
  'senior',
] as const;
export type PetStage = (typeof PET_STAGES)[number];

export type PetSpecies = 'slime' | 'dragon' | 'cyber_cat' | 'dino' | 'blob';

export const PET_MOODS = [
  'happy',
  'neutral',
  'sad',
  'sleeping',
  'sick',
  'hungry',
] as const;
export type PetMood = (typeof PET_MOODS)[number];

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

export const GAME_TREAT_IDS = [
  'chess_cookie',
  'sea_battle_fish',
  'hearts_candy',
  'critical_pepper',
  'pachisi_spice',
] as const;
export type GameTreatId = (typeof GAME_TREAT_IDS)[number];

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
