import type { AdminStatsAudienceMetrics } from '../interfaces/admin-statistics.types';
import {
  calculateStickiness,
  calculatePlaytimeHours,
  calculateAvgPlaytimePerUserMinutes,
} from './admin-statistics-helpers';

export interface AudienceRawData {
  totalCount: number;
  dau: number;
  wau: number;
  mau: number;
  gamesTotal: number;
  gamesToday: number;
  games7d: number;
  games30d: number;
  completionRate: number;
  inactiveCount: number;
}

export function buildAudienceMetrics(
  raw: AudienceRawData,
): AdminStatsAudienceMetrics {
  const stickyFactorDauMau = calculateStickiness(raw.dau, raw.mau);
  const stickyFactorDauWau = calculateStickiness(raw.dau, raw.wau);
  const stickyFactorWauMau = calculateStickiness(raw.wau, raw.mau);
  const avgPlaytimePerActiveUserMinutes = calculateAvgPlaytimePerUserMinutes(
    raw.gamesToday,
    raw.dau,
  );
  const avgMatchesPerActiveUser =
    raw.dau > 0 ? Number((raw.gamesToday / raw.dau).toFixed(1)) : 0;
  const estimatedPlaytimeHours = calculatePlaytimeHours(raw.gamesTotal);
  const inactivityRate =
    raw.totalCount > 0
      ? Number(((raw.inactiveCount / raw.totalCount) * 100).toFixed(1))
      : 0;

  return {
    totalCount: raw.totalCount,
    dau: raw.dau,
    wau: raw.wau,
    mau: raw.mau,
    stickyFactorDauMau,
    stickyFactorDauWau,
    stickyFactorWauMau,
    avgPlaytimePerActiveUserMinutes,
    avgMatchesPerActiveUser,
    gamesTotal: raw.gamesTotal,
    gamesToday: raw.gamesToday,
    games7d: raw.games7d,
    games30d: raw.games30d,
    estimatedPlaytimeHours,
    completionRate: raw.completionRate,
    inactiveCount: raw.inactiveCount,
    inactivityRate,
  };
}
