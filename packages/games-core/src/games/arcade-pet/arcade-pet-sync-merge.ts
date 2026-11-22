import { sanitizePetName } from './arcade-pet-name';
import {
  GAME_TREAT_IDS,
  type GameTreatId,
  type PetState,
} from './arcade-pet.types';
import {
  calculateStage,
  clamp,
  clampElapsedMs,
  deriveMood,
  levelFromPetXp,
  roundXp,
} from './arcade-pet.core';

/** Most of one treat type a pet may hold. */
export const MAX_TREAT_STOCK = 99;
/** XP a single sync may add on top of time-based growth (care actions). */
export const MAX_XP_BURST_PER_SYNC = 200;
const XP_PER_GROWTH_HOUR = 20;
const HOUR_MS = 60 * 60 * 1000;

const finite = (v: number, fallback: number): number =>
  Number.isFinite(v) ? v : fallback;

function mergeInventory(
  client: Partial<Record<string, number>> | undefined,
  server: PetState['inventory'],
): PetState['inventory'] {
  const result = { ...server };
  for (const id of GAME_TREAT_IDS) {
    const value = client?.[id];
    if (typeof value === 'number' && Number.isFinite(value)) {
      result[id as GameTreatId] = clamp(Math.floor(value), 0, MAX_TREAT_STOCK);
    }
  }
  return result;
}

/**
 * Merges a client-reported pet onto the server's copy. Identity (id, species,
 * theme, bornAt) always comes from the server, and progression (growth, xp,
 * level, stage) may only move forward within what elapsed time plus a small
 * burst can explain, so a forged payload cannot jump a pet to a high level or
 * a rare stage. Care state (needs, sleep, sickness, name, treats) is
 * client-writable because care actions run on the client; it is range-checked.
 */
export function mergeClientPet(
  server: PetState,
  client: PetState,
  now: number,
): PetState {
  const elapsedHours =
    clampElapsedMs(now - server.timestamps.lastInteractedAt) / HOUR_MS;

  const serverGrowth = server.stats.growthHours ?? 0;
  const growthHours = clamp(
    finite(client.stats.growthHours ?? serverGrowth, serverGrowth),
    serverGrowth,
    serverGrowth + elapsedHours + 0.05,
  );
  const xp = roundXp(
    clamp(
      finite(client.stats.xp, server.stats.xp),
      server.stats.xp,
      server.stats.xp +
        elapsedHours * XP_PER_GROWTH_HOUR +
        MAX_XP_BURST_PER_SYNC,
    ),
  );

  const clampTs = (ts: number, fallback: number): number =>
    clamp(finite(ts, fallback), 0, now);
  const stats = {
    hunger: clamp(client.stats.hunger, 0, 100),
    happiness: clamp(client.stats.happiness, 0, 100),
    energy: clamp(client.stats.energy, 0, 100),
    hygiene: clamp(client.stats.hygiene, 0, 100),
    discipline: clamp(client.stats.discipline, 0, 100),
    health: clamp(client.stats.health, 0, 100),
    weight: clamp(client.stats.weight, 0, 1000),
    xp,
    level: levelFromPetXp(xp),
    growthHours,
  };
  const isSleeping = Boolean(client.isSleeping);
  const isSick = Boolean(client.isSick);

  // A client may hatch an egg (egg -> baby); every later stage follows growth.
  const stageHint =
    server.stage === 'egg' && client.stage !== 'egg' ? 'baby' : server.stage;

  return {
    ...server,
    name: sanitizePetName(client.name) ?? server.name,
    stage: calculateStage(
      server.timestamps.bornAt,
      now,
      stageHint,
      growthHours,
    ),
    stats,
    timestamps: {
      bornAt: server.timestamps.bornAt,
      lastInteractedAt: clampTs(
        client.timestamps.lastInteractedAt,
        server.timestamps.lastInteractedAt,
      ),
      lastFedAt: clampTs(
        client.timestamps.lastFedAt,
        server.timestamps.lastFedAt,
      ),
      lastSleptAt: clampTs(
        client.timestamps.lastSleptAt,
        server.timestamps.lastSleptAt,
      ),
      lastCleanedAt: clampTs(
        client.timestamps.lastCleanedAt,
        server.timestamps.lastCleanedAt,
      ),
      lastTrainedAt: clampTs(
        client.timestamps.lastTrainedAt,
        server.timestamps.lastTrainedAt,
      ),
    },
    isSleeping,
    isSick,
    poopCount: Math.floor(clamp(finite(client.poopCount, 0), 0, 4)),
    careMistakes: Math.floor(clamp(finite(client.careMistakes, 0), 0, 1000)),
    inventory: mergeInventory(client.inventory, server.inventory),
    mood: deriveMood({ isSleeping, isSick, stats }),
  };
}
