import {
  CHECKERS_PER_MODE,
  TOTAL_POINTS,
  type Mode,
} from './backgammon.constants';
import type { BackgammonPoint, LegalMove, WinType } from './backgammon.types';

export function createInitialPoints(
  player0Id: string,
  player1Id: string,
  mode: Mode = 'standard',
): BackgammonPoint[] {
  const points: BackgammonPoint[] = Array.from(
    { length: TOTAL_POINTS },
    () => ({
      playerId: null,
      count: 0,
    }),
  );

  if (mode === 'hyper') {
    points[23] = { playerId: player0Id, count: 1 };
    points[22] = { playerId: player0Id, count: 1 };
    points[21] = { playerId: player0Id, count: 1 };

    points[0] = { playerId: player1Id, count: 1 };
    points[1] = { playerId: player1Id, count: 1 };
    points[2] = { playerId: player1Id, count: 1 };
    return points;
  }

  if (mode === 'long' || mode === 'gulbara') {
    points[23] = { playerId: player0Id, count: 15 };
    points[0] = { playerId: player1Id, count: 15 };
    return points;
  }

  if (mode === 'nackgammon') {
    points[23] = { playerId: player0Id, count: 2 };
    points[22] = { playerId: player0Id, count: 2 };
    points[12] = { playerId: player0Id, count: 4 };
    points[7] = { playerId: player0Id, count: 3 };
    points[5] = { playerId: player0Id, count: 4 };

    points[0] = { playerId: player1Id, count: 2 };
    points[1] = { playerId: player1Id, count: 2 };
    points[11] = { playerId: player1Id, count: 4 };
    points[16] = { playerId: player1Id, count: 3 };
    points[18] = { playerId: player1Id, count: 4 };
    return points;
  }

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
  mode: Mode = 'standard',
): boolean {
  const targetCheckers = CHECKERS_PER_MODE[mode] ?? 15;
  if (barCount > 0) return false;
  if (borneOffCount >= targetCheckers) return false;

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

  return homeCount + borneOffCount === targetCheckers;
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

export function isPointOpen(
  targetIndex: number,
  playerId: string,
  points: BackgammonPoint[],
  mode: Mode = 'standard',
): boolean {
  const point = points[targetIndex];
  if (!point || point.count === 0 || point.playerId === playerId) {
    return true;
  }
  if (mode === 'long' || mode === 'gulbara') {
    return false;
  }
  return point.count === 1;
}

/**
 * Classifies win quality per standard backgammon scoring:
 * - `backgammon`: loser bore off nothing AND has checkers on the bar or in
 *   the winner's home board.
 * - `gammon`: loser bore off nothing.
 * - `single`: otherwise (or forfeits).
 */
export function determineWinType(
  winnerId: string,
  playerOrder: string[],
  points: BackgammonPoint[],
  bar: Record<string, number>,
  borneOff: Record<string, number>,
): WinType {
  const loserId = playerOrder.find((id) => id !== winnerId);
  if (!loserId) return 'single';
  if ((borneOff[loserId] ?? 0) > 0) return 'single';

  const winnerIsP0 = isPlayer0(winnerId, playerOrder);
  if ((bar[loserId] ?? 0) > 0) return 'backgammon';

  // Winner's home board: P0 bears in from high points into 0-5,
  // P1 from low points into 18-23.
  const [start, end] = winnerIsP0 ? [0, 5] : [18, 23];
  let losersInWinnerHome = 0;
  for (let i = start; i <= end; i++) {
    if (points[i].playerId === loserId) {
      losersInWinnerHome += points[i].count;
    }
  }

  return losersInWinnerHome > 0 ? 'backgammon' : 'gammon';
}

export function getLegalMovesForDie(
  playerId: string,
  playerOrder: string[],
  points: BackgammonPoint[],
  bar: Record<string, number>,
  borneOff: Record<string, number>,
  die: number,
  mode: Mode = 'standard',
): LegalMove[] {
  const moves: LegalMove[] = [];
  const barCount = bar[playerId] ?? 0;
  const borneOffCount = borneOff[playerId] ?? 0;
  const isP0 = isPlayer0(playerId, playerOrder);
  const isNoHitting = mode === 'long' || mode === 'gulbara';
  const canBearOff = canPlayerBearOff(
    playerId,
    playerOrder,
    points,
    barCount,
    borneOffCount,
    mode,
  );

  if (barCount > 0) {
    if (isNoHitting) return [];
    const target = isP0 ? 24 - die : die - 1;
    if (
      target >= 0 &&
      target < TOTAL_POINTS &&
      isPointOpen(target, playerId, points, mode)
    ) {
      const targetPoint = points[target];
      const isHit =
        !isNoHitting &&
        !!(
          targetPoint &&
          targetPoint.playerId &&
          targetPoint.playerId !== playerId &&
          targetPoint.count === 1
        );
      moves.push({ from: 'bar', to: target, die, isHit });
    }
    return moves;
  }

  for (let from = 0; from < TOTAL_POINTS; from++) {
    const point = points[from];
    if (point.playerId !== playerId || point.count === 0) continue;

    if (isP0) {
      const to = from - die;
      if (to >= 0) {
        if (isPointOpen(to, playerId, points, mode)) {
          const targetPoint = points[to];
          const isHit =
            !isNoHitting &&
            !!(
              targetPoint &&
              targetPoint.playerId &&
              targetPoint.playerId !== playerId &&
              targetPoint.count === 1
            );
          moves.push({ from, to, die, isHit });
        }
      } else if (canBearOff) {
        if (to === -1) {
          moves.push({ from, to: 'off', die, isHit: false });
        } else {
          let hasCheckersFurther = false;
          for (let f = 5; f > from; f--) {
            if (points[f].playerId === playerId && points[f].count > 0) {
              hasCheckersFurther = true;
              break;
            }
          }
          if (!hasCheckersFurther) {
            moves.push({ from, to: 'off', die, isHit: false });
          }
        }
      }
    } else {
      const to = from + die;
      if (to < TOTAL_POINTS) {
        if (isPointOpen(to, playerId, points, mode)) {
          const targetPoint = points[to];
          const isHit =
            !isNoHitting &&
            !!(
              targetPoint &&
              targetPoint.playerId &&
              targetPoint.playerId !== playerId &&
              targetPoint.count === 1
            );
          moves.push({ from, to, die, isHit });
        }
      } else if (canBearOff) {
        if (to === 24) {
          moves.push({ from, to: 'off', die, isHit: false });
        } else {
          let hasCheckersFurther = false;
          for (let f = 18; f < from; f++) {
            if (points[f].playerId === playerId && points[f].count > 0) {
              hasCheckersFurther = true;
              break;
            }
          }
          if (!hasCheckersFurther) {
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
  mode: Mode = 'standard',
): LegalMove[] {
  const uniqueDice = Array.from(new Set(dice));
  const allMoves: LegalMove[] = [];

  for (const die of uniqueDice) {
    const movesForDie = getLegalMovesForDie(
      playerId,
      playerOrder,
      points,
      bar,
      borneOff,
      die,
      mode,
    );
    allMoves.push(...movesForDie);
  }

  return allMoves;
}
