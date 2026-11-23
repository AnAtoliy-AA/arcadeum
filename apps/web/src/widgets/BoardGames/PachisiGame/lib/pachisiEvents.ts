import type { PachisiToken } from '../types';
import { FINISH_PROGRESS, MAIN_PATH_STEPS } from '../types';
import { absoluteCell } from './boardLayout';

type TokenMap = Record<string, PachisiToken[]>;

export interface CaptureEvent {
  ownerId: string;
  tokenId: number;
  /** Track cell the token was standing on, or null if unknown. */
  cell: number | null;
}

/**
 * Tokens that went from the track back to the yard between two snapshots.
 * Returns an empty list when there is no previous snapshot.
 */
export function detectCaptures(
  prev: TokenMap | null | undefined,
  next: TokenMap | null | undefined,
  seats: Record<string, number> = {},
): CaptureEvent[] {
  if (!prev || !next) return [];
  const events: CaptureEvent[] = [];
  for (const [ownerId, tokens] of Object.entries(next)) {
    const prevTokens = prev[ownerId];
    if (!prevTokens) continue;
    for (const token of tokens) {
      const before = prevTokens.find((p) => p.id === token.id);
      if (before && before.progress >= 0 && token.progress === -1) {
        const seat = seats[ownerId];
        const cell =
          seat !== undefined && before.progress < MAIN_PATH_STEPS
            ? absoluteCell(seat, before.progress)
            : null;
        events.push({ ownerId, tokenId: token.id, cell });
      }
    }
  }
  return events;
}

export function countFinishedTokens(
  tokens: TokenMap | null | undefined,
): number {
  if (!tokens) return 0;
  return Object.values(tokens).reduce(
    (acc, list) =>
      acc + list.filter((t) => t.progress === FINISH_PROGRESS).length,
    0,
  );
}

/** Owners whose finished-token count grew between two snapshots. */
export function ownersWithNewFinish(
  prev: TokenMap | null | undefined,
  next: TokenMap | null | undefined,
): string[] {
  if (!prev || !next) return [];
  return Object.entries(next)
    .filter(([ownerId, list]) => {
      const before = (prev[ownerId] ?? []).filter(
        (t) => t.progress === FINISH_PROGRESS,
      ).length;
      return list.filter((t) => t.progress === FINISH_PROGRESS).length > before;
    })
    .map(([ownerId]) => ownerId);
}
