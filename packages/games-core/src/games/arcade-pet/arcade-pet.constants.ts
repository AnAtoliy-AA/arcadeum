import type { GameTreatId, PetSpecies, PetStage } from './arcade-pet.types';

export const DECAY_RATES_PER_HOUR = {
  hungerAwake: 12,
  hungerAsleep: 4,
  hungerHome: 4,
  happinessAwake: 10,
  happinessAsleep: 2,
  energyAwake: 8,
  energyAsleep: -25,
  hygiene: 6,
  discipline: 2,
} as const;

export const GROWTH_RATES = {
  runningMultiplier: 1.0,
  homeMultiplier: 0.33,
  minHungerFactor: 0.1,
} as const;

export const STAGE_THRESHOLDS_HOURS: Record<PetStage, number> = {
  egg: 0,
  baby: 0.02,
  child: 2,
  teen: 12,
  adult: 36,
  senior: 96,
};

export const TREAT_EFFECTS: Record<
  GameTreatId,
  {
    hunger: number;
    happiness: number;
    energy: number;
    hygiene: number;
    xp: number;
    label: string;
  }
> = {
  chess_cookie: {
    hunger: 20,
    happiness: 30,
    energy: 15,
    hygiene: 0,
    xp: 25,
    label: 'Chess Cookie',
  },
  sea_battle_fish: {
    hunger: 35,
    happiness: 25,
    energy: 20,
    hygiene: -5,
    xp: 30,
    label: 'Sea Battle Fish',
  },
  hearts_candy: {
    hunger: 15,
    happiness: 45,
    energy: 10,
    hygiene: -10,
    xp: 25,
    label: 'Hearts Candy',
  },
  critical_pepper: {
    hunger: 25,
    happiness: 20,
    energy: 40,
    hygiene: 0,
    xp: 35,
    label: 'Critical Pepper',
  },
  pachisi_spice: {
    hunger: 20,
    happiness: 35,
    energy: 25,
    hygiene: 0,
    xp: 30,
    label: 'Pachisi Spice',
  },
};

export const DEFAULT_THEME = 'retro';

export const ALL_SPECIES: readonly PetSpecies[] = [
  'slime',
  'dragon',
  'cyber_cat',
  'dino',
  'blob',
] as const;
