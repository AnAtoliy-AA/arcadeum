import {
  DECAY_RATES_PER_HOUR,
  STAGE_THRESHOLDS_HOURS,
  TREAT_EFFECTS,
} from './arcade-pet.constants';
import type {
  ArcadePetActionResult,
  GameTreatId,
  PetActionType,
  PetMood,
  PetSpecies,
  PetStage,
  PetState,
} from './arcade-pet.types';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function calculateStage(
  bornAt: number,
  now: number,
  currentStage?: PetStage,
): PetStage {
  const ageHours = Math.max(0, (now - bornAt) / (1000 * 60 * 60));
  let calculated: PetStage = 'egg';
  if (ageHours >= STAGE_THRESHOLDS_HOURS.senior) calculated = 'senior';
  else if (ageHours >= STAGE_THRESHOLDS_HOURS.adult) calculated = 'adult';
  else if (ageHours >= STAGE_THRESHOLDS_HOURS.teen) calculated = 'teen';
  else if (ageHours >= STAGE_THRESHOLDS_HOURS.child) calculated = 'child';
  else if (ageHours >= STAGE_THRESHOLDS_HOURS.baby) calculated = 'baby';

  if (currentStage && currentStage !== 'egg' && calculated === 'egg') {
    return 'baby';
  }
  return calculated;
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

export function applyDeterministicDecay(
  state: PetState,
  now: number = Date.now(),
): PetState {
  if (state.stage === 'egg') {
    const nextStage = calculateStage(state.timestamps.bornAt, now);
    return {
      ...state,
      stage: nextStage,
      mood: deriveMood({
        isSleeping: state.isSleeping,
        isSick: state.isSick,
        stats: state.stats,
      }),
    };
  }

  const elapsedMs = Math.max(0, now - state.timestamps.lastInteractedAt);
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  if (elapsedHours <= 0) return state;

  const hungerDecay = state.isSleeping
    ? DECAY_RATES_PER_HOUR.hungerAsleep
    : DECAY_RATES_PER_HOUR.hungerAwake;
  const happinessDecay = state.isSleeping
    ? DECAY_RATES_PER_HOUR.happinessAsleep
    : DECAY_RATES_PER_HOUR.happinessAwake;
  const energyDecay = state.isSleeping
    ? DECAY_RATES_PER_HOUR.energyAsleep
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
    state.stats.hygiene - DECAY_RATES_PER_HOUR.hygiene * elapsedHours,
    0,
    100,
  );
  const newDiscipline = clamp(
    state.stats.discipline - DECAY_RATES_PER_HOUR.discipline * elapsedHours,
    0,
    100,
  );

  const additionalPoop = Math.floor(elapsedHours / 6);
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

  const newStage = calculateStage(state.timestamps.bornAt, now, state.stage);

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

export function createInitialPet(params: {
  id: string;
  name: string;
  species?: PetSpecies;
  theme?: string;
  now?: number;
}): PetState {
  const now = params.now ?? Date.now();
  return {
    id: params.id,
    name: params.name || 'ArcadePet',
    species: params.species ?? 'slime',
    stage: 'egg',
    theme: params.theme ?? 'retro',
    stats: {
      hunger: 80,
      happiness: 80,
      energy: 90,
      hygiene: 100,
      discipline: 50,
      health: 90,
      weight: 5,
      level: 1,
      xp: 0,
    },
    timestamps: {
      bornAt: now,
      lastInteractedAt: now,
      lastFedAt: now,
      lastSleptAt: now,
      lastCleanedAt: now,
      lastTrainedAt: now,
    },
    isSleeping: false,
    poopCount: 0,
    isSick: false,
    inventory: {
      chess_cookie: 2,
      sea_battle_fish: 1,
      hearts_candy: 1,
      critical_pepper: 1,
      pachisi_spice: 1,
    },
    careMistakes: 0,
    mood: 'neutral',
  };
}

export function executePetAction(
  rawState: PetState,
  action: PetActionType,
  payload?: {
    treatId?: GameTreatId;
    species?: PetSpecies;
    theme?: string;
    now?: number;
  },
): ArcadePetActionResult {
  const now = payload?.now ?? Date.now();
  const state = applyDeterministicDecay(rawState, now);

  if (action === 'hatch') {
    const updated: PetState = {
      ...state,
      stage: 'baby',
      species: payload?.species ?? state.species,
      theme: payload?.theme ?? state.theme,
      timestamps: {
        ...state.timestamps,
        lastInteractedAt: now,
      },
      mood: 'happy',
    };
    return { success: true, messageCode: 'hatched', state: updated };
  }

  if (state.stage === 'egg') {
    return { success: false, messageCode: 'is_egg', state };
  }

  if (action === 'sleep') {
    const updated: PetState = {
      ...state,
      isSleeping: true,
      timestamps: { ...state.timestamps, lastSleptAt: now, lastInteractedAt: now },
      mood: 'sleeping',
    };
    return { success: true, messageCode: 'sleeping', state: updated };
  }

  if (action === 'wake') {
    const updated: PetState = {
      ...state,
      isSleeping: false,
      timestamps: { ...state.timestamps, lastInteractedAt: now },
      mood: deriveMood({
        isSleeping: false,
        isSick: state.isSick,
        stats: state.stats,
      }),
    };
    return { success: true, messageCode: 'woken', state: updated };
  }

  if (state.isSleeping) {
    return { success: false, messageCode: 'is_sleeping', state };
  }

  switch (action) {
    case 'feed_meal': {
      if (state.stats.hunger >= 95) {
        return { success: false, messageCode: 'full', state };
      }
      const updated: PetState = {
        ...state,
        stats: {
          ...state.stats,
          hunger: clamp(state.stats.hunger + 30, 0, 100),
          weight: state.stats.weight + 1,
          xp: state.stats.xp + 10,
        },
        timestamps: { ...state.timestamps, lastFedAt: now, lastInteractedAt: now },
        mood: 'happy',
      };
      return { success: true, messageCode: 'fed_meal', state: updated };
    }

    case 'feed_snack': {
      const updated: PetState = {
        ...state,
        stats: {
          ...state.stats,
          hunger: clamp(state.stats.hunger + 10, 0, 100),
          happiness: clamp(state.stats.happiness + 20, 0, 100),
          weight: state.stats.weight + 2,
          xp: state.stats.xp + 5,
        },
        timestamps: { ...state.timestamps, lastFedAt: now, lastInteractedAt: now },
        mood: 'happy',
      };
      return { success: true, messageCode: 'fed_snack', state: updated };
    }

    case 'feed_treat': {
      const treatId = payload?.treatId;
      if (!treatId || !state.inventory[treatId] || state.inventory[treatId] <= 0) {
        return { success: false, messageCode: 'no_treat', state };
      }
      const effect = TREAT_EFFECTS[treatId];
      const newInventory = {
        ...state.inventory,
        [treatId]: state.inventory[treatId] - 1,
      };
      const newXp = state.stats.xp + effect.xp;
      const newLevel = Math.floor(newXp / 100) + 1;
      const updated: PetState = {
        ...state,
        inventory: newInventory,
        stats: {
          ...state.stats,
          hunger: clamp(state.stats.hunger + effect.hunger, 0, 100),
          happiness: clamp(state.stats.happiness + effect.happiness, 0, 100),
          energy: clamp(state.stats.energy + effect.energy, 0, 100),
          hygiene: clamp(state.stats.hygiene + effect.hygiene, 0, 100),
          xp: newXp,
          level: newLevel,
        },
        timestamps: { ...state.timestamps, lastFedAt: now, lastInteractedAt: now },
        mood: 'happy',
      };
      return { success: true, messageCode: 'fed_treat', state: updated };
    }

    case 'play': {
      if (state.stats.energy < 15) {
        return { success: false, messageCode: 'tired', state };
      }
      const newXp = state.stats.xp + 20;
      const newLevel = Math.floor(newXp / 100) + 1;
      const updated: PetState = {
        ...state,
        stats: {
          ...state.stats,
          happiness: clamp(state.stats.happiness + 25, 0, 100),
          energy: clamp(state.stats.energy - 15, 0, 100),
          weight: Math.max(1, state.stats.weight - 1),
          xp: newXp,
          level: newLevel,
        },
        timestamps: { ...state.timestamps, lastInteractedAt: now },
        mood: 'happy',
      };
      return { success: true, messageCode: 'played', state: updated };
    }

    case 'clean': {
      const updated: PetState = {
        ...state,
        poopCount: 0,
        stats: {
          ...state.stats,
          hygiene: 100,
          happiness: clamp(state.stats.happiness + 10, 0, 100),
        },
        timestamps: {
          ...state.timestamps,
          lastCleanedAt: now,
          lastInteractedAt: now,
        },
        mood: 'happy',
      };
      return { success: true, messageCode: 'cleaned', state: updated };
    }

    case 'heal': {
      if (!state.isSick) {
        return { success: false, messageCode: 'not_sick', state };
      }
      const updated: PetState = {
        ...state,
        isSick: false,
        stats: {
          ...state.stats,
          health: clamp(state.stats.health + 40, 0, 100),
        },
        timestamps: { ...state.timestamps, lastInteractedAt: now },
        mood: 'happy',
      };
      return { success: true, messageCode: 'healed', state: updated };
    }

    case 'train': {
      if (state.stats.energy < 20) {
        return { success: false, messageCode: 'tired', state };
      }
      const updated: PetState = {
        ...state,
        stats: {
          ...state.stats,
          discipline: clamp(state.stats.discipline + 20, 0, 100),
          energy: clamp(state.stats.energy - 20, 0, 100),
          xp: state.stats.xp + 15,
        },
        timestamps: {
          ...state.timestamps,
          lastTrainedAt: now,
          lastInteractedAt: now,
        },
        mood: 'neutral',
      };
      return { success: true, messageCode: 'trained', state: updated };
    }

    case 'praise': {
      const updated: PetState = {
        ...state,
        stats: {
          ...state.stats,
          happiness: clamp(state.stats.happiness + 15, 0, 100),
        },
        timestamps: { ...state.timestamps, lastInteractedAt: now },
        mood: 'happy',
      };
      return { success: true, messageCode: 'praised', state: updated };
    }

    case 'scold': {
      const updated: PetState = {
        ...state,
        stats: {
          ...state.stats,
          discipline: clamp(state.stats.discipline + 10, 0, 100),
          happiness: clamp(state.stats.happiness - 15, 0, 100),
        },
        timestamps: { ...state.timestamps, lastInteractedAt: now },
        mood: 'sad',
      };
      return { success: true, messageCode: 'scolded', state: updated };
    }

    default:
      return { success: false, messageCode: 'unknown_action', state };
  }
}
