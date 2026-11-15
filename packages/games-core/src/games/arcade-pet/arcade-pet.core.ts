import { GROWTH_RATES, STAGE_THRESHOLDS_HOURS } from './arcade-pet.constants';
import type { PetMood, PetStage } from './arcade-pet.types';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Longest offline gap counted for decay/growth; guards against clock changes. */
export const MAX_ELAPSED_MS = 30 * 24 * 60 * 60 * 1000;

export function clampElapsedMs(elapsedMs: number): number {
  if (!Number.isFinite(elapsedMs)) return 0;
  return clamp(elapsedMs, 0, MAX_ELAPSED_MS);
}

export const PET_XP_PER_LEVEL = 100;

export function levelFromPetXp(xp: number): number {
  return Math.max(1, Math.floor(xp / PET_XP_PER_LEVEL) + 1);
}

export function calculateStage(
  bornAt: number,
  now: number,
  currentStage?: PetStage,
  growthHours?: number,
): PetStage {
  const ageHours = typeof growthHours === 'number' ? growthHours : 0;
  if (ageHours >= STAGE_THRESHOLDS_HOURS.senior) return 'senior';
  if (ageHours >= STAGE_THRESHOLDS_HOURS.adult) return 'adult';
  if (ageHours >= STAGE_THRESHOLDS_HOURS.teen) return 'teen';
  if (ageHours >= STAGE_THRESHOLDS_HOURS.child) return 'child';
  if (ageHours >= STAGE_THRESHOLDS_HOURS.baby) return 'baby';
  return currentStage && currentStage !== 'egg' ? 'baby' : 'egg';
}

export function getGrowthSpeedPercent(
  hunger: number,
  isAtHome = false,
): number {
  const base = isAtHome
    ? GROWTH_RATES.homeMultiplier
    : GROWTH_RATES.runningMultiplier;
  const hungerFactor = clamp(hunger / 100, GROWTH_RATES.minHungerFactor, 1.0);
  return Math.round(base * hungerFactor * 100);
}

export function deriveMood(state: {
  isSleeping: boolean;
  isSick: boolean;
  stats: { hunger: number; happiness: number };
}): PetMood {
  if (state.isSleeping) return 'sleeping';
  if (state.isSick) return 'sick';
  if (state.stats.hunger < 25) return 'hungry';
  if (state.stats.happiness > 60) return 'happy';
  if (state.stats.happiness < 30) return 'sad';
  return 'neutral';
}

export function roundXp(xp: number): number {
  return Math.round(xp * 100) / 100;
}
