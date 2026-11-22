import type { PetStage, PetState } from '@arcadeum/games-core';

export interface AwaySummary {
  petName: string;
  awayMs: number;
  hungerDrop: number;
  growthHoursGained: number;
  stageBefore: PetStage;
  stageAfter: PetStage;
}

/** Shortest absence that is worth reporting to the player. */
export const MIN_AWAY_MS = 15 * 60 * 1000;

/**
 * Compares a pet before and after offline decay. Returns null when the
 * player was away only briefly or nothing noticeable changed.
 */
export function buildAwaySummary(
  before: PetState,
  after: PetState,
  now: number,
): AwaySummary | null {
  const awayMs = now - before.timestamps.lastInteractedAt;
  if (!Number.isFinite(awayMs) || awayMs < MIN_AWAY_MS) return null;

  const hungerDrop = Math.max(
    0,
    Math.round(before.stats.hunger - after.stats.hunger),
  );
  const growthHoursGained = Math.max(
    0,
    Math.round(
      ((after.stats.growthHours ?? 0) - (before.stats.growthHours ?? 0)) * 10,
    ) / 10,
  );
  if (
    hungerDrop === 0 &&
    growthHoursGained === 0 &&
    before.stage === after.stage
  ) {
    return null;
  }

  return {
    petName: after.name,
    awayMs,
    hungerDrop,
    growthHoursGained,
    stageBefore: before.stage,
    stageAfter: after.stage,
  };
}

export function formatAwayDuration(awayMs: number): string {
  const totalMinutes = Math.floor(awayMs / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
