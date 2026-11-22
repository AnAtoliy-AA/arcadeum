import {
  DECAY_RATES_PER_HOUR,
  GROWTH_RATES,
  STAGE_THRESHOLDS_HOURS,
} from './arcade-pet.constants';
import type { PetState } from './arcade-pet.types';
import {
  calculateStage,
  clamp,
  clampElapsedMs,
  deriveMood,
  levelFromPetXp,
  roundXp,
} from './arcade-pet.core';

export interface DecayOptions {
  isAtHome?: boolean;
}

export function applyDeterministicDecay(
  state: PetState,
  now: number = Date.now(),
  options?: DecayOptions,
): PetState {
  if (state.stage === 'egg') {
    const elapsedMs = clampElapsedMs(now - state.timestamps.lastInteractedAt);
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    const isAtHome = Boolean(options?.isAtHome);
    const growthMultiplier = isAtHome
      ? GROWTH_RATES.homeMultiplier
      : GROWTH_RATES.runningMultiplier;
    const currentGrowth = state.stats.growthHours ?? 0;
    const gainedGrowth = elapsedHours * growthMultiplier;
    const newGrowthHours =
      Math.round((currentGrowth + gainedGrowth) * 1000) / 1000;
    const nextStage = calculateStage(
      state.timestamps.bornAt,
      now,
      state.stage,
      newGrowthHours,
    );
    return {
      ...state,
      stage: nextStage,
      stats: {
        ...state.stats,
        growthHours: newGrowthHours,
      },
      timestamps: {
        ...state.timestamps,
        lastInteractedAt: now,
      },
      mood: deriveMood({
        isSleeping: state.isSleeping,
        isSick: state.isSick,
        stats: state.stats,
      }),
    };
  }

  const elapsedMs = clampElapsedMs(now - state.timestamps.lastInteractedAt);
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  if (elapsedHours <= 0) return state;

  const isAtHome = Boolean(options?.isAtHome);

  const hungerDecay = state.isSleeping
    ? DECAY_RATES_PER_HOUR.hungerAsleep
    : isAtHome
      ? DECAY_RATES_PER_HOUR.hungerHome
      : DECAY_RATES_PER_HOUR.hungerAwake;
  const happinessDecay = state.isSleeping
    ? DECAY_RATES_PER_HOUR.happinessAsleep
    : isAtHome
      ? DECAY_RATES_PER_HOUR.happinessAsleep
      : DECAY_RATES_PER_HOUR.happinessAwake;
  const energyDecay = state.isSleeping
    ? DECAY_RATES_PER_HOUR.energyAsleep
    : isAtHome
      ? 0
      : DECAY_RATES_PER_HOUR.energyAwake;

  const newHunger = clamp(
    state.stats.hunger - hungerDecay * elapsedHours,
    0,
    100,
  );
  const newHappiness = clamp(
    state.stats.happiness - happinessDecay * elapsedHours,
    0,
    100,
  );
  const newEnergy = clamp(
    state.stats.energy - energyDecay * elapsedHours,
    0,
    100,
  );
  const newHygiene = clamp(
    state.stats.hygiene -
      (isAtHome ? 1 : DECAY_RATES_PER_HOUR.hygiene) * elapsedHours,
    0,
    100,
  );
  const newDiscipline = clamp(
    state.stats.discipline -
      (isAtHome ? 0.5 : DECAY_RATES_PER_HOUR.discipline) * elapsedHours,
    0,
    100,
  );

  const additionalPoop = isAtHome ? 0 : Math.floor(elapsedHours / 6);
  const totalPoop = Math.min(4, state.poopCount + additionalPoop);

  const shouldBeSick =
    state.isSick || newHygiene < 20 || totalPoop >= 3 || newHunger < 10;

  const healthScore = clamp(
    (newHunger + newHappiness + newEnergy + newHygiene) / 4 -
      (shouldBeSick ? 25 : 0) -
      totalPoop * 5,
    0,
    100,
  );

  const avgHunger = (state.stats.hunger + newHunger) / 2;
  const hungerFactor = clamp(
    avgHunger / 100,
    GROWTH_RATES.minHungerFactor,
    1.0,
  );
  const growthMultiplier = isAtHome
    ? GROWTH_RATES.homeMultiplier
    : GROWTH_RATES.runningMultiplier;

  const currentGrowth =
    typeof state.stats.growthHours === 'number'
      ? state.stats.growthHours
      : (STAGE_THRESHOLDS_HOURS[state.stage] ?? 0);

  const gainedGrowth = elapsedHours * growthMultiplier * hungerFactor;
  const newGrowthHours =
    Math.round((currentGrowth + gainedGrowth) * 1000) / 1000;

  const newStage = calculateStage(
    state.timestamps.bornAt,
    now,
    state.stage,
    newGrowthHours,
  );

  const newXp = roundXp(state.stats.xp + gainedGrowth * 20);
  const newLevel = levelFromPetXp(newXp);

  const updatedState: PetState = {
    ...state,
    stage: newStage,
    isSick: shouldBeSick,
    poopCount: totalPoop,
    stats: {
      ...state.stats,
      hunger: Math.round(newHunger),
      happiness: Math.round(newHappiness),
      energy: Math.round(newEnergy),
      hygiene: Math.round(newHygiene),
      discipline: Math.round(newDiscipline),
      health: Math.round(healthScore),
      growthHours: newGrowthHours,
      xp: newXp,
      level: newLevel,
    },
    timestamps: {
      ...state.timestamps,
      lastInteractedAt: now,
    },
  };

  return {
    ...updatedState,
    mood: deriveMood({
      isSleeping: updatedState.isSleeping,
      isSick: updatedState.isSick,
      stats: updatedState.stats,
    }),
  };
}
