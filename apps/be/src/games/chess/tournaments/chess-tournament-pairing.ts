/**
 * Arena and Swiss pairing algorithms for chess tournaments.
 *
 * Arena: ELO-based pairing with anti-repetition. Players who finish
 * get paired immediately against the nearest-rated available opponent.
 * Win streak bonus: 2 pts base, +1 per streak win (max 5).
 *
 * Swiss: FIDE-style round-robin within rating brackets. Uses
 * Buchholz/Medvitsch tiebreak calculation.
 */

export interface PlayerRating {
  userId: string;
  rating: number;
}

export interface ArenaStanding {
  userId: string;
  points: number;
  streak: number;
  wins: number;
  draws: number;
  losses: number;
  lastOpponents: string[];
}

/**
 * Arena pairing: match the available player with the nearest rating
 * who hasn't been played recently. O(n log n) sort + greedy match.
 */
export function pairArenaPlayers(
  availablePlayers: PlayerRating[],
  standings: Map<string, ArenaStanding>,
  maxRecentOpponentHistory = 3,
): Array<{ playerA: string; playerB: string }> {
  const pairs: Array<{ playerA: string; playerB: string }> = [];
  const sorted = [...availablePlayers].sort((a, b) => a.rating - b.rating);
  const used = new Set<string>();

  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i];
    if (!a || used.has(a.userId)) continue;

    let bestMatch: PlayerRating | null = null;
    let bestDist = Infinity;

    for (let j = i + 1; j < sorted.length; j++) {
      const b = sorted[j];
      if (!b || used.has(b.userId)) continue;

      const dist = Math.abs(a.rating - b.rating);

      const aStanding = standings.get(a.userId);
      const bStanding = standings.get(b.userId);
      const aRecent = aStanding?.lastOpponents ?? [];
      const bRecent = bStanding?.lastOpponents ?? [];
      const recentPenalty =
        (aRecent.slice(-maxRecentOpponentHistory).includes(b.userId)
          ? 500
          : 0) +
        (bRecent.slice(-maxRecentOpponentHistory).includes(a.userId) ? 500 : 0);

      const effectiveDist = dist + recentPenalty;
      if (effectiveDist < bestDist) {
        bestDist = effectiveDist;
        bestMatch = b;
      }
    }

    if (bestMatch) {
      pairs.push({ playerA: a.userId, playerB: bestMatch.userId });
      used.add(a.userId);
      used.add(bestMatch.userId);
    }
  }

  return pairs;
}

/**
 * Arena score calculation with win streak bonus.
 * Win = 2 pts base + min(streak, 3) bonus.
 * Draw = 1 pt. Loss = 0.
 */
export function calculateArenaPoints(
  result: 'win' | 'draw' | 'loss',
  currentStreak: number,
): { points: number; newStreak: number } {
  if (result === 'win') {
    const bonus = Math.min(currentStreak, 3);
    return { points: 2 + bonus, newStreak: currentStreak + 1 };
  }
  if (result === 'draw') {
    return { points: 1, newStreak: 0 };
  }
  return { points: 0, newStreak: 0 };
}

/**
 * Swiss pairing: group players by score bracket, pair within bracket.
 * Odd player in a bracket gets paired with nearest-score opponent from
 * adjacent bracket. Avoid repeat pairings.
 */
export function pairSwissPlayers(
  standings: Array<{
    userId: string;
    score: number;
    opponents: string[];
  }>,
  roundNumber: number,
): Array<{ playerA: string; playerB: string }> {
  const pairs: Array<{ playerA: string; playerB: string }> = [];
  const sorted = [...standings].sort((a, b) => b.score - a.score);
  const used = new Set<string>();

  const brackets: Array<typeof sorted> = [];
  let currentBracket: typeof sorted = [];
  let currentScore = -1;

  for (const player of sorted) {
    if (player.score !== currentScore) {
      if (currentBracket.length > 0) brackets.push(currentBracket);
      currentBracket = [player];
      currentScore = player.score;
    } else {
      currentBracket.push(player);
    }
  }
  if (currentBracket.length > 0) brackets.push(currentBracket);

  for (const bracket of brackets) {
    for (let i = 0; i < bracket.length; i++) {
      const a = bracket[i];
      if (!a || used.has(a.userId)) continue;

      let bestMatch: (typeof sorted)[0] | null = null;
      let bestScore = -Infinity;

      for (let j = i + 1; j < bracket.length; j++) {
        const b = bracket[j];
        if (!b || used.has(b.userId)) continue;
        if (a.opponents.includes(b.userId)) continue;

        const scoreDiff = Math.abs(a.score - b.score);
        const parityBonus = roundNumber % 2 === 0 ? -scoreDiff : scoreDiff;
        const matchScore = -scoreDiff * 10 + parityBonus;

        if (matchScore > bestScore) {
          bestScore = matchScore;
          bestMatch = b;
        }
      }

      if (bestMatch) {
        pairs.push({ playerA: a.userId, playerB: bestMatch.userId });
        used.add(a.userId);
        used.add(bestMatch.userId);
      }
    }
  }

  const unpaired = sorted.find((p) => !used.has(p.userId));
  if (unpaired) {
    const available = sorted.filter(
      (p) => !used.has(p.userId) && !unpaired.opponents.includes(p.userId),
    );
    if (available.length > 0) {
      available.sort(
        (a, b) =>
          Math.abs(a.score - unpaired.score) -
          Math.abs(b.score - unpaired.score),
      );
      const match = available[0];
      if (match) {
        pairs.push({ playerA: unpaired.userId, playerB: match.userId });
      }
    }
  }

  return pairs;
}

/**
 * Buchholz tiebreak: sum of opponents' scores.
 */
export function calculateBuchholz(
  opponents: Array<{ finalScore: number }>,
): number {
  return opponents.reduce((sum, o) => sum + o.finalScore, 0);
}

/**
 * Medvitsch tiebreak: sum of opponents' Buchholz scores.
 */
export function calculateMedvitsch(
  opponents: Array<{
    opponents: Array<{ finalScore: number }>;
  }>,
): number {
  return opponents.reduce((sum, o) => sum + calculateBuchholz(o.opponents), 0);
}
