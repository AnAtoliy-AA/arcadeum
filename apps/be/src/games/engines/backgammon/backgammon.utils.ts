import { CHECKERS_PER_PLAYER, TOTAL_POINTS } from './backgammon.constants';
import type { BackgammonPoint, LegalMove } from './backgammon.types';

export function createInitialPoints(
  player0Id: string,
  player1Id: string,
): BackgammonPoint[] {
  const points: BackgammonPoint[] = Array.from(
    { length: TOTAL_POINTS },
    () => ({
      playerId: null,
      count: 0,
    }),
  );

  points[23] = { playerId: player0Id, count: 2 };
  points[12] = { playerId: player0Id, count: 5 };
  points[7] = { playerId: player0Id, count: 3 };
  points[5] = { playerId: player0Id, count: 5 };

  points[0] = { playerId: player1Id, count: 2 };
  points[11] = { playerId: player1Id, count: 5 };
  points[16] = { playerId: player1Id, count: 3 };
  points[18] = { playerId: player1Id, count: 5 };

  return points;
}

export function isPlayer0(playerId: string, playerOrder: string[]): boolean {
  return playerOrder[0] === playerId;
}

export function canPlayerBearOff(
  playerId: string,
  playerOrder: string[],
  points: BackgammonPoint[],
  barCount: number,
  borneOffCount: number,
): boolean {
  if (barCount > 0) return false;
  if (borneOffCount >= CHECKERS_PER_PLAYER) return false;

  const isP0 = isPlayer0(playerId, playerOrder);
  let homeCount = 0;

  if (isP0) {
    for (let i = 0; i <= 5; i++) {
      if (points[i].playerId === playerId) {
        homeCount += points[i].count;
      }
    }
  } else {
    for (let i = 18; i <= 23; i++) {
      if (points[i].playerId === playerId) {
        homeCount += points[i].count;
      }
    }
  }

  return homeCount + borneOffCount === CHECKERS_PER_PLAYER;
}

export function calculatePipCount(
  playerId: string,
  playerOrder: string[],
  points: BackgammonPoint[],
  barCount: number,
): number {
  const isP0 = isPlayer0(playerId, playerOrder);
  let pips = barCount * 25;

  for (let i = 0; i < TOTAL_POINTS; i++) {
    if (points[i].playerId === playerId) {
      const distance = isP0 ? i + 1 : 24 - i;
      pips += points[i].count * distance;
    }
  }

  return pips;
}

export function getTargetPoint(
  playerId: string,
  playerOrder: string[],
  from: number | 'bar',
  die: number,
): number | 'off' | null {
  const isP0 = isPlayer0(playerId, playerOrder);

  if (from === 'bar') {
    return isP0 ? 24 - die : die - 1;
  }

  if (isP0) {
    const to = from - die;
    if (to >= 0) return to;
    if (to === -1) return 'off';
    return 'off';
  } else {
    const to = from + die;
    if (to < TOTAL_POINTS) return to;
    if (to === TOTAL_POINTS) return 'off';
    return 'off';
  }
}

export function isPointOpen(
  targetIndex: number,
  playerId: string,
  points: BackgammonPoint[],
): boolean {
  const point = points[targetIndex];
  if (!point || point.count === 0 || point.playerId === playerId) {
    return true;
  }
  return point.count === 1;
}

export function getLegalMovesForDie(
  playerId: string,
  playerOrder: string[],
  points: BackgammonPoint[],
  bar: Record<string, number>,
  borneOff: Record<string, number>,
  die: number,
): LegalMove[] {
  const moves: LegalMove[] = [];
  const barCount = bar[playerId] ?? 0;
  const borneOffCount = borneOff[playerId] ?? 0;
  const isP0 = isPlayer0(playerId, playerOrder);
  const canBearOff = canPlayerBearOff(
    playerId,
    playerOrder,
    points,
    barCount,
    borneOffCount,
  );

  if (barCount > 0) {
    const target = isP0 ? 24 - die : die - 1;
    if (target >= 0 && target < TOTAL_POINTS) {
      if (isPointOpen(target, playerId, points)) {
        const isHit =
          points[target].playerId !== null &&
          points[target].playerId !== playerId &&
          points[target].count === 1;
        moves.push({ from: 'bar', to: target, die, isHit });
      }
    }
    return moves;
  }

  for (let from = 0; from < TOTAL_POINTS; from++) {
    if (points[from].playerId !== playerId || points[from].count <= 0) {
      continue;
    }

    if (isP0) {
      const toIndex = from - die;
      if (toIndex >= 0) {
        if (isPointOpen(toIndex, playerId, points)) {
          const isHit =
            points[toIndex].playerId !== null &&
            points[toIndex].playerId !== playerId &&
            points[toIndex].count === 1;
          moves.push({ from, to: toIndex, die, isHit });
        }
      } else if (canBearOff) {
        if (toIndex === -1) {
          moves.push({ from, to: 'off', die, isHit: false });
        } else {
          let hasHigher = false;
          for (let p = from + 1; p <= 5; p++) {
            if (points[p].playerId === playerId && points[p].count > 0) {
              hasHigher = true;
              break;
            }
          }
          if (!hasHigher) {
            moves.push({ from, to: 'off', die, isHit: false });
          }
        }
      }
    } else {
      const toIndex = from + die;
      if (toIndex < TOTAL_POINTS) {
        if (isPointOpen(toIndex, playerId, points)) {
          const isHit =
            points[toIndex].playerId !== null &&
            points[toIndex].playerId !== playerId &&
            points[toIndex].count === 1;
          moves.push({ from, to: toIndex, die, isHit });
        }
      } else if (canBearOff) {
        if (toIndex === TOTAL_POINTS) {
          moves.push({ from, to: 'off', die, isHit: false });
        } else {
          let hasFurther = false;
          for (let p = 18; p < from; p++) {
            if (points[p].playerId === playerId && points[p].count > 0) {
              hasFurther = true;
              break;
            }
          }
          if (!hasFurther) {
            moves.push({ from, to: 'off', die, isHit: false });
          }
        }
      }
    }
  }

  return moves;
}

export function getAllLegalMoves(
  playerId: string,
  playerOrder: string[],
  points: BackgammonPoint[],
  bar: Record<string, number>,
  borneOff: Record<string, number>,
  dice: number[],
): LegalMove[] {
  const uniqueDice = Array.from(new Set(dice));
  const moves: LegalMove[] = [];

  for (const die of uniqueDice) {
    const dieMoves = getLegalMovesForDie(
      playerId,
      playerOrder,
      points,
      bar,
      borneOff,
      die,
    );
    moves.push(...dieMoves);
  }

  return moves;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}
