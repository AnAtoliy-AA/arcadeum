/**
 * Pure tournament bracket generation + single-elimination advance logic.
 *
 * No randomness: players are seeded by registration order. Byes are
 * represented as matches with a `null` slot — the non-null player is the
 * winner, so bye auto-advance falls out of normal winner resolution.
 *
 * Single elimination structure: round 1 pairs players sequentially; an
 * odd leftover player gets a trailing bye match. Each subsequent round
 * holds `ceil(previous / 2)` matches, which yields the same round count
 * as padding the field to the next power of two while guaranteeing every
 * match has at least one real player (never two null slots).
 */

export type BracketFormat = 'single_elimination' | 'round_robin';

export const BRACKET_FORMATS: readonly BracketFormat[] = [
  'single_elimination',
  'round_robin',
] as const;

export interface BracketMatch {
  round: number;
  matchIndex: number;
  playerIds: [string | null, string | null];
  winnerUserId: string | null;
}

export interface GeneratedBracket {
  format: BracketFormat;
  rounds: BracketMatch[][];
}

export interface BracketPlacement {
  round: number;
  matchIndex: number;
  playerId: string;
}

export function generateSingleEliminationBracket(
  playerIds: string[],
): GeneratedBracket {
  const rounds: BracketMatch[][] = [];
  let slotCount = playerIds.length;
  let round = 1;

  while (slotCount > 1) {
    const matchCount = Math.ceil(slotCount / 2);
    const matches: BracketMatch[] = [];
    for (let m = 0; m < matchCount; m++) {
      // Only round 1 is seeded from the registration order; later
      // rounds start empty and are filled via advance placements.
      const a = round === 1 ? (playerIds[m * 2] ?? null) : null;
      // Round 1 pairs sequentially; an odd tail becomes a bye match.
      const b = round === 1 ? (playerIds[m * 2 + 1] ?? null) : null;
      matches.push({
        round,
        matchIndex: m,
        playerIds: [a, b],
        winnerUserId: null,
      });
    }
    rounds.push(matches);
    slotCount = matchCount;
    round++;
  }

  return { format: 'single_elimination', rounds };
}

export function generateRoundRobinBracket(
  playerIds: string[],
): GeneratedBracket {
  const seats: (string | null)[] = [...playerIds];
  if (seats.length % 2 === 1) seats.push(null);

  const n = seats.length;
  const rounds: BracketMatch[][] = [];
  const circle = [...seats];

  for (let r = 0; r < n - 1; r++) {
    const matches: BracketMatch[] = [];
    for (let i = 0; i < n / 2; i++) {
      matches.push({
        round: r + 1,
        matchIndex: i,
        playerIds: [circle[i] ?? null, circle[n - 1 - i] ?? null],
        winnerUserId: null,
      });
    }
    rounds.push(matches);
    // Circle method: fix seat 0, rotate the rest by one.
    const fixed = circle[0];
    if (fixed === undefined) break;
    const rest = circle.slice(1);
    const last = rest.pop();
    if (last !== undefined) rest.unshift(last);
    circle.splice(0, circle.length, fixed, ...rest);
  }

  return { format: 'round_robin', rounds };
}

/**
 * Compute where the winner of `(round, matchIndex)` lands in later rounds.
 *
 * Returns one placement per hop: the immediate next-round slot plus any
 * cascade through structural bye slots (a slot whose feeder match does not
 * exist in the previous round can never be filled, so a match left with
 * exactly one real player is decided automatically).
 */
export function resolveSingleEliminationAdvance(
  rounds: BracketMatch[][],
  round: number,
  matchIndex: number,
  winnerUserId: string,
): BracketPlacement[] {
  const placements: BracketPlacement[] = [];

  let currentRound = round;
  let currentIndex = matchIndex;
  const currentPlayer = winnerUserId;

  for (;;) {
    const nextRoundIndex = currentRound; // rounds[currentRound - 1 + 1]
    const nextRoundArr = rounds[nextRoundIndex];
    if (!nextRoundArr) break;

    const nextMatchIndex = Math.floor(currentIndex / 2);
    const position = currentIndex % 2;
    const targetMatch = nextRoundArr[nextMatchIndex];
    if (!targetMatch) break;

    placements.push({
      round: currentRound + 1,
      matchIndex: nextMatchIndex,
      playerId: currentPlayer,
    });

    // Cascade only through structural byes: the sibling slot's feeder
    // match lives in `currentRound` at index nextMatchIndex*2 + otherPos.
    const otherPosition = position === 0 ? 1 : 0;
    const feederIndex = nextMatchIndex * 2 + otherPosition;
    const feederExists = !!rounds[currentRound - 1]?.[feederIndex];
    if (feederExists) break;

    currentRound = currentRound + 1;
    currentIndex = nextMatchIndex;
  }

  return placements;
}
