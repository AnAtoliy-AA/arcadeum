import type { PetSpecies } from '@arcadeum/games-core';

export interface SpeciesBehaviorProfile {
  species: PetSpecies;
  title: string;
  personality: string;
  movementDescription: string;
  cadenceMs: number;
  minRow: number;
  maxRow: number;
  maxStepDistance: number;
  emotes: readonly string[];
  friendGreetingEmotes: readonly string[];
  knockEmotes: readonly string[];
  walkClassKey:
    'catWalk' | 'dragonFly' | 'dinoStomp' | 'blobBounce' | 'slimeSlide';
  happyClassKey:
    'catPounce' | 'dragonBreath' | 'dinoRoar' | 'blobSpin' | 'slimeBubble';
}

export const SPECIES_BEHAVIORS: Record<PetSpecies, SpeciesBehaviorProfile> = {
  cyber_cat: {
    species: 'cyber_cat',
    title: 'Agile Prowler',
    personality:
      'Playful, curious, and lightning-fast. Stalks, dashes, and pounces.',
    movementDescription:
      'Fast darting sprints, pauses to groom or stalk, quick direction pivots.',
    cadenceMs: 1800,
    minRow: 1,
    maxRow: 5,
    maxStepDistance: 2,
    emotes: ['🐾', '🐟', '🧶', '⚡', '🐱', '✨'],
    friendGreetingEmotes: ['❤️', '😻', '🐾', '✨'],
    knockEmotes: ['🐾', '🚪', '😺'],
    walkClassKey: 'catWalk',
    happyClassKey: 'catPounce',
  },
  dragon: {
    species: 'dragon',
    title: 'Sky Monarch',
    personality:
      'Majestic, soaring, and proud. Loves circling the upper skies.',
    movementDescription:
      'Graceful sweeping diagonal arcs across high altitudes with fiery sparks.',
    cadenceMs: 2200,
    minRow: 3,
    maxRow: 7,
    maxStepDistance: 2,
    emotes: ['🔥', '💎', '👑', '✨', '⚡', '🐉'],
    friendGreetingEmotes: ['🔥', '👑', '✨', '🎉'],
    knockEmotes: ['🔥', '🚪', '🐲'],
    walkClassKey: 'dragonFly',
    happyClassKey: 'dragonBreath',
  },
  dino: {
    species: 'dino',
    title: 'Gentle Stomper',
    personality:
      'Sturdy, cheerful, and methodical. Shakes the floor and loves snacks.',
    movementDescription:
      'Heavy grounded footsteps, deliberate pacing, stops for leaf treats.',
    cadenceMs: 3200,
    minRow: 0,
    maxRow: 4,
    maxStepDistance: 1,
    emotes: ['🦖', '🌿', '🍖', '🌋', '⭐', '💥'],
    friendGreetingEmotes: ['🦖', '🍖', '⭐', '🤝'],
    knockEmotes: ['✊', '💥', '🦖'],
    walkClassKey: 'dinoStomp',
    happyClassKey: 'dinoRoar',
  },
  blob: {
    species: 'blob',
    title: 'Bouncy Acrobat',
    personality:
      'Energetic, erratic, and bubbly. Hops all over with squishy glee.',
    movementDescription:
      'Unpredictable high hops, double bounces, squishy acrobatics everywhere.',
    cadenceMs: 1600,
    minRow: 0,
    maxRow: 7,
    maxStepDistance: 2,
    emotes: ['🫧', '⭐', '💫', '🍮', '🎉', '💖'],
    friendGreetingEmotes: ['🫧', '💖', '🎉', '🌟'],
    knockEmotes: ['🫧', '🚪', '👋'],
    walkClassKey: 'blobBounce',
    happyClassKey: 'blobSpin',
  },
  slime: {
    species: 'slime',
    title: 'Chill Glider',
    personality:
      'Relaxed, calm, and soothing. Glides along the floor like liquid jelly.',
    movementDescription:
      'Silky smooth floor-level ooze, cozy catnaps, bubbly trails.',
    cadenceMs: 2600,
    minRow: 0,
    maxRow: 3,
    maxStepDistance: 1,
    emotes: ['🧪', '💧', '💤', '🍏', '✨', '🌈'],
    friendGreetingEmotes: ['💧', '💤', '💚', '🍮'],
    knockEmotes: ['💧', '🚪', '💤'],
    walkClassKey: 'slimeSlide',
    happyClassKey: 'slimeBubble',
  },
};

export function getSpeciesBehavior(
  species: PetSpecies,
): SpeciesBehaviorProfile {
  return SPECIES_BEHAVIORS[species] ?? SPECIES_BEHAVIORS.cyber_cat;
}

export function pickSpeciesTarget(
  species: PetSpecies,
  currentCol: number,
  currentRow: number,
): { targetCol: number; targetRow: number } {
  const profile = getSpeciesBehavior(species);
  const rowSpan = Math.max(1, profile.maxRow - profile.minRow + 1);
  let targetRow = profile.minRow + Math.floor(Math.random() * rowSpan);
  let targetCol = Math.floor(Math.random() * 10);

  if (Math.abs(targetCol - currentCol) < 3) {
    targetCol = (currentCol + 5) % 10;
  }
  if (Math.abs(targetRow - currentRow) < 2) {
    targetRow = profile.minRow + ((currentRow - profile.minRow + 2) % rowSpan);
  }
  return {
    targetCol: Math.max(0, Math.min(9, targetCol)),
    targetRow: Math.max(profile.minRow, Math.min(profile.maxRow, targetRow)),
  };
}

export function computeNextStep(
  species: PetSpecies,
  currentCol: number,
  currentRow: number,
  targetCol: number,
  targetRow: number,
  prevDir: 'left' | 'right',
): { nextCol: number; nextRow: number; dir: 'left' | 'right' } {
  const profile = getSpeciesBehavior(species);
  const diffX = targetCol - currentCol;
  const diffY = targetRow - currentRow;

  const stepLimit = profile.maxStepDistance;
  const stepX =
    diffX === 0
      ? 0
      : diffX > 0
        ? Math.min(stepLimit, diffX)
        : Math.max(-stepLimit, diffX);
  const stepY =
    diffY === 0
      ? 0
      : diffY > 0
        ? Math.min(stepLimit, diffY)
        : Math.max(-stepLimit, diffY);

  const nextCol = Math.max(0, Math.min(9, currentCol + stepX));
  const nextRow = Math.max(
    profile.minRow,
    Math.min(profile.maxRow, currentRow + stepY),
  );
  const dir: 'left' | 'right' =
    stepX > 0 ? 'right' : stepX < 0 ? 'left' : prevDir;

  return { nextCol, nextRow, dir };
}

export function pickRandomSpeciesEmote(
  species: PetSpecies,
  type: 'ambient' | 'friend' | 'knock' = 'ambient',
): string {
  const profile = getSpeciesBehavior(species);
  const list =
    type === 'friend'
      ? profile.friendGreetingEmotes
      : type === 'knock'
        ? profile.knockEmotes
        : profile.emotes;
  return list[Math.floor(Math.random() * list.length)] ?? '😄';
}
